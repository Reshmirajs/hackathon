"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';
import { Loader2 } from 'lucide-react';

interface CanvasEditorProps {
    bookId: string;
    pageId: string;
    activeTool: string;
    toolPayload?: any;
    activePageId?: string;
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
    activePageId,
    width = 450,
    height = 650,
    color = '#000000',
    brushWidth = 3
}: CanvasEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<any>(null);
    const fabricCanvasRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const historyRef = useRef<string[]>([]);
    const saveRef = useRef<() => void>(() => { });
    const isRemoteRef = useRef<React.MutableRefObject<boolean>>({ current: false });

    // Stable refs for props so we don't re-run heavy effects
    const activeToolRef = useRef(activeTool);
    activeToolRef.current = activeTool;
    const colorRef = useRef(color);
    colorRef.current = color;
    const brushWidthRef = useRef(brushWidth);
    brushWidthRef.current = brushWidth;

    const { saveCanvas, isRemoteUpdate } = useCollaboration(bookId, pageId, fabricCanvasRef.current);

    // Keep refs in sync
    useEffect(() => {
        saveRef.current = saveCanvas;
        isRemoteRef.current = isRemoteUpdate;
    }, [saveCanvas, isRemoteUpdate]);

    // ── Initialize Fabric.js ──
    useEffect(() => {
        if (typeof window === 'undefined' || !canvasRef.current) return;
        if (fabricCanvasRef.current) return; // Already initialized

        let disposed = false;

        const init = async () => {
            try {
                const fabricModule = await import('fabric');
                const fabric = fabricModule.fabric ?? fabricModule.default?.fabric ?? fabricModule.default;
                if (!fabric || disposed) return;

                fabricRef.current = fabric;

                const canvas = new fabric.Canvas(canvasRef.current, {
                    height,
                    width,
                    backgroundColor: 'transparent',
                    isDrawingMode: false,
                    selection: true,
                    preserveObjectStacking: true,
                    renderOnAddRemove: true,
                    enableRetinaScaling: true,
                    allowTouchScrolling: false,
                });

                // Initialize brush
                const PencilBrush = fabric.PencilBrush;
                if (PencilBrush) {
                    canvas.freeDrawingBrush = new PencilBrush(canvas);
                    canvas.freeDrawingBrush.width = brushWidth;
                    canvas.freeDrawingBrush.color = color;
                }

                fabricCanvasRef.current = canvas;

                // ── Save handler ──
                const handleModification = () => {
                    if (isRemoteRef.current?.current) return;
                    const json = JSON.stringify(canvas.toJSON());
                    const h = historyRef.current;
                    historyRef.current = [...h, json].slice(-30);
                    saveRef.current();
                };

                canvas.on('object:modified', handleModification);
                canvas.on('path:created', handleModification);
                canvas.on('object:added', handleModification);
                canvas.on('object:removed', handleModification);

                // Apply initial tool
                applyTool(canvas, fabric, activeTool, toolPayload);

                // CRITICAL: Recalculate canvas offset after the flip book has laid out.
                // HTMLFlipBook uses CSS transforms that shift the canvas position.
                // Without this, Fabric.js thinks the canvas is at a different position
                // than where it visually appears, causing drag/draw offset issues.
                canvas.calcOffset();
                setTimeout(() => canvas.calcOffset(), 300);
                setTimeout(() => canvas.calcOffset(), 1000);

                setIsReady(true);
                console.log('[CanvasEditor] Fabric canvas initialized for', pageId);
            } catch (e) {
                console.error('[CanvasEditor] Fabric init error:', e);
            }
        };

        init();

        return () => {
            disposed = true;
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
                fabricCanvasRef.current = null;
            }
        };
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    // ── Recalculate Fabric.js offset on interaction ──
    // NOTE: We intentionally do NOT stop event propagation here.
    // Fabric.js v5 registers mousemove/mouseup on the DOCUMENT during drag/draw.
    // stopPropagation() would prevent those from firing, breaking drag/draw inside the book.
    // Since HTMLFlipBook has useMouseEvents={false}, propagation is safe.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Recalculate Fabric.js offset whenever the user enters the canvas area.
        // This fixes coordinate mismatches caused by HTMLFlipBook CSS transforms.
        const recalcOffset = () => {
            const canvas = fabricCanvasRef.current;
            if (canvas) canvas.calcOffset();
        };

        container.addEventListener('mouseenter', recalcOffset);
        container.addEventListener('pointerenter', recalcOffset);
        window.addEventListener('resize', recalcOffset);
        window.addEventListener('scroll', recalcOffset, true);

        return () => {
            container.removeEventListener('mouseenter', recalcOffset);
            container.removeEventListener('pointerenter', recalcOffset);
            window.removeEventListener('resize', recalcOffset);
            window.removeEventListener('scroll', recalcOffset, true);
        };
    }, []);

    // ── Apply tool function (no useEffect, called imperatively) ──
    function applyTool(canvas: any, fabric: any, tool: string, payload?: any) {
        if (!canvas || !fabric) return;

        // CRITICAL: Recalculate canvas position before applying any tool.
        // HTMLFlipBook CSS transforms can shift the canvas, causing pointer offset.
        canvas.calcOffset();

        // Remove previous mouse:down listeners by clearing all
        canvas.__eventListeners = canvas.__eventListeners || {};
        canvas.__eventListeners['mouse:down'] = [];
        canvas.__eventListeners['mouse:down:before'] = [];

        // Re-add the permanent offset recalculator on every mouse:down
        // This ensures that coordinates are recalculated right before EVERY interaction
        canvas.on('mouse:down:before', function () {
            canvas.calcOffset();
        });

        // Reset canvas state
        canvas.isDrawingMode = false;
        canvas.selection = tool === 'select';
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';

        // Ensure all objects are interactive
        canvas.forEachObject((obj: any) => {
            obj.selectable = true;
            obj.evented = true;
            obj.hasControls = true;
            obj.hasBorders = true;
            obj.lockMovementX = false;
            obj.lockMovementY = false;
        });

        if (tool === 'brush') {
            canvas.isDrawingMode = true;
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            const PencilBrush = fabric.PencilBrush;
            if (PencilBrush) {
                canvas.freeDrawingBrush = new PencilBrush(canvas);
                canvas.freeDrawingBrush.width = brushWidthRef.current;
                canvas.freeDrawingBrush.color = colorRef.current;
                canvas.freeDrawingBrush.decimate = 2;
            }

        } else if (tool === 'eraser') {
            canvas.isDrawingMode = true;
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            const PencilBrush = fabric.PencilBrush;
            if (PencilBrush) {
                canvas.freeDrawingBrush = new PencilBrush(canvas);
                canvas.freeDrawingBrush.width = Math.max(10, brushWidthRef.current * 3);
                canvas.freeDrawingBrush.color = 'rgba(0,0,0,1)';
                canvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
            }

        } else if (['text', 'image', 'circle', 'rect'].includes(tool)) {
            canvas.defaultCursor = 'crosshair';
            canvas.on('mouse:down', function onPlacementClick(options: any) {
                if (options.target) return; // Don't add if clicking existing object

                const pointer = canvas.getPointer(options.e);

                if (tool === 'text') {
                    const text = new fabric.IText('Type here...', {
                        left: pointer.x,
                        top: pointer.y,
                        fontFamily: 'Inter, serif',
                        fill: colorRef.current,
                        fontSize: 24,
                        selectable: true,
                        evented: true,
                        hasControls: true,
                        hasBorders: true,
                        editable: true,
                    });
                    canvas.add(text);
                    canvas.setActiveObject(text);
                    setTimeout(() => {
                        text.enterEditing();
                        text.selectAll();
                    }, 100);
                    canvas.renderAll();

                } else if (tool === 'image') {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.style.display = 'none';
                    input.onchange = (e: any) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (f) => {
                                const data = f.target?.result as string;
                                if (!data) return;
                                fabric.Image.fromURL(data, (img: any) => {
                                    if (!img) return;
                                    img.set({
                                        left: pointer.x - 75,
                                        top: pointer.y - 75,
                                        selectable: true,
                                        evented: true,
                                        hasControls: true,
                                        hasBorders: true,
                                    });
                                    img.scaleToWidth(150);
                                    canvas.add(img);
                                    canvas.setActiveObject(img);
                                    canvas.renderAll();
                                });
                            };
                            reader.readAsDataURL(file);
                        }
                        if (document.body.contains(input)) document.body.removeChild(input);
                    };
                    document.body.appendChild(input);
                    input.click();

                } else if (tool === 'circle') {
                    const circle = new fabric.Circle({
                        radius: 40,
                        fill: 'transparent',
                        stroke: colorRef.current,
                        strokeWidth: Math.max(2, brushWidthRef.current),
                        left: pointer.x - 40,
                        top: pointer.y - 40,
                        selectable: true,
                        evented: true,
                        hasControls: true,
                        hasBorders: true,
                    });
                    canvas.add(circle);
                    canvas.setActiveObject(circle);
                    canvas.renderAll();

                } else if (tool === 'rect') {
                    const rect = new fabric.Rect({
                        width: 80,
                        height: 80,
                        fill: 'transparent',
                        stroke: colorRef.current,
                        strokeWidth: Math.max(2, brushWidthRef.current),
                        left: pointer.x - 40,
                        top: pointer.y - 40,
                        selectable: true,
                        evented: true,
                        hasControls: true,
                        hasBorders: true,
                    });
                    canvas.add(rect);
                    canvas.setActiveObject(rect);
                    canvas.renderAll();
                }
            });

        } else if (tool === 'select') {
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.hoverCursor = 'move';
        }

        canvas.renderAll();
    }

    // ── React to tool changes ──
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        const fabric = fabricRef.current;
        if (!canvas || !fabric) return;

        const isVisible = canvas.getElement()?.offsetParent !== null;
        const isActivePage = activePageId && activePageId !== 'inactive';

        // Handle one-shot actions
        if (activeTool === 'sticker' && toolPayload && isVisible && isActivePage) {
            const sticker = new fabric.IText(toolPayload, {
                left: width / 2 - 40,
                top: height / 2 - 40,
                fontSize: 80,
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true,
                editable: false,
            });
            canvas.add(sticker);
            canvas.setActiveObject(sticker);
            canvas.renderAll();
            return;
        }

        if (activeTool === 'clear' && isVisible && isActivePage) {
            canvas.clear();
            canvas.backgroundColor = 'transparent';
            canvas.renderAll();
            saveRef.current();
            return;
        }

        if (activeTool === 'undo' && isVisible && isActivePage) {
            const h = historyRef.current;
            if (h.length > 0) {
                const lastState = h[h.length - 2] || '{}';
                isRemoteRef.current.current = true;
                canvas.loadFromJSON(lastState, () => {
                    canvas.renderAll();
                    historyRef.current = h.slice(0, -1);
                    saveRef.current();
                    setTimeout(() => { isRemoteRef.current.current = false; }, 100);
                });
            }
            return;
        }

        if (activeTool === 'download' && isVisible && isActivePage) {
            const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2, quality: 1 });
            const link = document.createElement('a');
            link.download = `lumin-journal-${pageId}-${Date.now()}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Apply the current tool
        applyTool(canvas, fabric, activeTool, toolPayload);

    }, [activeTool, toolPayload, activePageId, width, height, pageId]);

    // ── Update brush settings live ──
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        if (activeTool === 'brush' && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = brushWidth;
            canvas.freeDrawingBrush.color = color;
        } else if (activeTool === 'eraser' && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = Math.max(10, brushWidth * 3);
        }
    }, [brushWidth, color, activeTool]);

    // ── Delete key handler ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) return;
            const tag = document.activeElement?.tagName;
            if (tag === 'TEXTAREA' || tag === 'INPUT') return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                const active = canvas.getActiveObjects();
                if (active.length > 0) {
                    canvas.remove(...active);
                    canvas.discardActiveObject();
                    canvas.renderAll();
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // ── Drag-and-drop images onto canvas ──
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const canvas = fabricCanvasRef.current;
            const fabric = fabricRef.current;
            if (!canvas || !fabric) return;

            const file = e.dataTransfer?.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (f) => {
                    const data = f.target?.result as string;
                    fabric.Image.fromURL(data, (img: any) => {
                        if (!img) return;
                        img.set({
                            left: width / 2 - 75,
                            top: height / 2 - 75,
                            selectable: true,
                            evented: true,
                            hasControls: true,
                            hasBorders: true,
                        });
                        img.scaleToWidth(150);
                        canvas.add(img);
                        canvas.setActiveObject(img);
                        canvas.renderAll();
                    });
                };
                reader.readAsDataURL(file);
            }
        };

        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);

        return () => {
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('drop', handleDrop);
        };
    }, [width, height]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[400px]"
            style={{
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                pointerEvents: 'auto',
                cursor: (activeTool === 'brush' || activeTool === 'eraser') ? 'crosshair' : 'default',
            }}
        >
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20 backdrop-blur-sm">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={32} />
                        <p className="text-xs text-gray-600 font-medium">Preparing canvas...</p>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} />

            {/* Active tool indicator */}
            {isReady && activeTool !== 'select' && activePageId !== 'inactive' && (
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-bold text-gray-700">
                            {activeTool === 'brush' && '🖌️ Drawing'}
                            {activeTool === 'eraser' && '🧹 Erasing'}
                            {activeTool === 'text' && '📝 Add Text'}
                            {activeTool === 'image' && '🖼️ Add Image'}
                            {activeTool === 'circle' && '⭕ Circle'}
                            {activeTool === 'rect' && '⬜ Rectangle'}
                            {activeTool === 'sticker' && '⭐ Sticker'}
                        </span>
                    </div>
                </div>
            )}

            {/* Helpful hints */}
            {isReady && activePageId !== 'inactive' && (
                <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-lg shadow-lg z-10">
                    {activeTool === 'select' && '💡 Click objects to select, drag to move, handles to resize'}
                    {activeTool === 'brush' && '💡 Click and drag to draw'}
                    {activeTool === 'eraser' && '💡 Draw over areas to erase'}
                    {activeTool === 'text' && '💡 Click anywhere to add text'}
                    {activeTool === 'image' && '💡 Click anywhere to upload an image'}
                    {activeTool === 'circle' && '💡 Click to place a circle'}
                    {activeTool === 'rect' && '💡 Click to place a rectangle'}
                    {activeTool === 'sticker' && '💡 Sticker added! Drag to move, handles to resize'}
                </div>
            )}
        </div>
    );
}
