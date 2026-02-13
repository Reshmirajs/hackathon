"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';
import { Loader2 } from 'lucide-react';

interface CanvasEditorProps {
    bookId: string;
    pageId: string;
    activeTool: string;
    toolPayload?: any;
    width?: number;
    height?: number;
    color?: string;
    brushWidth?: number;
}

export default function CanvasEditor({
    bookId,
    pageId,
    activeTool,
    toolPayload,
    width = 450,
    height = 650,
    color = '#000000',
    brushWidth = 3
}: CanvasEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<any>(null);
    const [fabricCanvas, setFabricCanvas] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);

    const { saveCanvas, isRemoteUpdate } = useCollaboration(bookId, pageId, fabricCanvas);

    // Initialize Fabric
    useEffect(() => {
        let canvas: any;

        const init = async () => {
            try {
                const fabricModule = await import('fabric');
                const fabric = fabricModule.fabric || fabricModule.default;
                fabricRef.current = fabric;

                if (!canvasRef.current || !fabric) return;

                canvas = new fabric.Canvas(canvasRef.current, {
                    height: height,
                    width: width,
                    backgroundColor: 'transparent',
                    isDrawingMode: false,
                });

                setFabricCanvas(canvas);
                setIsReady(true);
            } catch (e) {
                console.error("Fabric init error:", e);
            }
        };

        if (!fabricCanvas) {
            init();
        }

        return () => {
            if (canvas) {
                canvas.dispose();
            }
        };
    }, []);

    // Handle Save Events
    useEffect(() => {
        if (!fabricCanvas) return;

        const handleSave = () => {
            if (!isRemoteUpdate.current) saveCanvas();
        };

        const handleObjectAdded = (e: any) => {
            // Prevent recursive saving when loading from JSON
            if (!isRemoteUpdate.current) saveCanvas();
        };

        fabricCanvas.on('object:modified', handleSave);
        fabricCanvas.on('path:created', handleSave);
        fabricCanvas.on('object:added', handleObjectAdded);
        fabricCanvas.on('object:removed', handleSave);

        return () => {
            fabricCanvas.off('object:modified', handleSave);
            fabricCanvas.off('path:created', handleSave);
            fabricCanvas.off('object:added', handleObjectAdded);
            fabricCanvas.off('object:removed', handleSave);
        };
    }, [fabricCanvas, saveCanvas, isRemoteUpdate]);

    // Handle Tools
    useEffect(() => {
        if (!fabricCanvas || !fabricRef.current) return;

        const fabric = fabricRef.current;

        // Reset
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = activeTool === 'select';
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.off('mouse:down');

        // Handle delete key
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const activeObjects = fabricCanvas.getActiveObjects();
                if (activeObjects.length > 0) {
                    fabricCanvas.remove(...activeObjects);
                    fabricCanvas.discardActiveObject();
                    fabricCanvas.renderAll();
                    saveCanvas();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Drag and Drop support
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const file = e.dataTransfer?.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (f) => {
                    const data = f.target?.result;
                    fabric.Image.fromURL(data, (img: any) => {
                        const pointer = fabricCanvas.getPointer(e);
                        img.set({
                            left: pointer.x,
                            top: pointer.y,
                            shadow: new fabric.Shadow({
                                color: 'rgba(0,0,0,0.1)',
                                blur: 10,
                                offsetX: 5,
                                offsetY: 5
                            })
                        });
                        img.scaleToWidth(150);
                        fabricCanvas.add(img);
                        fabricCanvas.setActiveObject(img);
                        saveCanvas();
                    });
                };
                reader.readAsDataURL(file);
            }
        };

        const canvasEl = fabricCanvas.getElement().parentElement;
        canvasEl?.addEventListener('dragover', handleDragOver);
        canvasEl?.addEventListener('drop', handleDrop);

        const handleMouseDown = (options: any) => {
            const pointer = fabricCanvas.getPointer(options.e);

            if (activeTool === 'text') {
                if (options.target) return;
                const text = new fabric.IText('Type...', {
                    left: pointer.x,
                    top: pointer.y,
                    fontFamily: 'serif',
                    fill: color,
                    fontSize: 20
                });
                fabricCanvas.add(text);
                fabricCanvas.setActiveObject(text);
                text.enterEditing();
                text.selectAll();
            } else if (activeTool === 'image') {
                if (options.target) return;
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e: any) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (f) => {
                        const data = f.target?.result;
                        fabric.Image.fromURL(data, (img: any) => {
                            img.set({
                                left: pointer.x,
                                top: pointer.y,
                                shadow: new fabric.Shadow({
                                    color: 'rgba(0,0,0,0.1)',
                                    blur: 10,
                                    offsetX: 5,
                                    offsetY: 5
                                })
                            });
                            img.scaleToWidth(150);
                            fabricCanvas.add(img);
                            fabricCanvas.setActiveObject(img);
                            saveCanvas();
                        });
                    };
                    reader.readAsDataURL(file);
                };
                input.click();
            } else if (activeTool === 'circle') {
                const circle = new fabric.Circle({
                    radius: 30,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth: brushWidth,
                    left: pointer.x,
                    top: pointer.y,
                });
                fabricCanvas.add(circle);
                fabricCanvas.setActiveObject(circle);
            } else if (activeTool === 'rect') {
                const rect = new fabric.Rect({
                    width: 60,
                    height: 60,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth: brushWidth,
                    left: pointer.x,
                    top: pointer.y,
                });
                fabricCanvas.add(rect);
                fabricCanvas.setActiveObject(rect);
            }
        };

        if (activeTool === 'brush') {
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.width = brushWidth;
            fabricCanvas.freeDrawingBrush.color = color;
        } else if (activeTool === 'eraser') {
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.width = brushWidth * 4;
            fabricCanvas.freeDrawingBrush.color = '#fdfbf7';
        } else if (['text', 'image', 'circle', 'rect'].includes(activeTool)) {
            fabricCanvas.defaultCursor = 'crosshair';
            fabricCanvas.on('mouse:down', handleMouseDown);
        } else if (activeTool === 'sticker') {
            if (toolPayload) {
                const sticker = new fabric.IText(toolPayload, {
                    left: width / 2 - 40 + (Math.random() * 80),
                    top: height / 2 - 40 + (Math.random() * 80),
                    fontSize: 80,
                    selectable: true,
                    shadow: new fabric.Shadow({
                        color: 'rgba(0,0,0,0.15)',
                        blur: 8,
                        offsetX: 4,
                        offsetY: 4
                    })
                });
                fabricCanvas.add(sticker);
                fabricCanvas.setActiveObject(sticker);
                saveCanvas();
            }
        } else if (activeTool === 'clear') {
            fabricCanvas.clear();
            fabricCanvas.backgroundColor = 'transparent';
            saveCanvas();
        } else if (activeTool === 'download') {
            const dataURL = fabricCanvas.toDataURL({ format: 'png', multiplier: 2 });
            const link = document.createElement('a');
            link.download = `page-${pageId}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        return () => {
            fabricCanvas.off('mouse:down', handleMouseDown);
            canvasEl?.removeEventListener('dragover', handleDragOver);
            canvasEl?.removeEventListener('drop', handleDrop);
            window.removeEventListener('keydown', handleKeyDown);
            fabricCanvas.isDrawingMode = false;
        };

    }, [activeTool, toolPayload, fabricCanvas, saveCanvas, width, height, pageId, color, brushWidth]);

    return (
        <div className="relative w-full h-full group">
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            )}
            <canvas ref={canvasRef} />
        </div>
    );
}
