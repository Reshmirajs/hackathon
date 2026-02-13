"use client";

import React, { useState } from 'react';
import { PenTool, Type, Image as ImageIcon, RotateCcw, Download, Palette, MousePointer, Sticker, FileText, MonitorPlay, Square, Circle, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolbarProps {
    onToolSelect: (tool: string, payload?: any) => void;
    activeTool: string;
    onClear: () => void;
    onUndo: () => void;
    onDownload: () => void;
    activeColor: string;
    onColorChange: (color: string) => void;
    brushWidth: number;
    onBrushWidthChange: (width: number) => void;
}

const STICKERS = [
    '⭐', '❤️', '🔥', '💡', '✅', '🎉', '📍', '💭', '🌈', '🎨', '📚', '✨'
];

const COLORS = [
    '#000000', '#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#71717a'
];

const Toolbar: React.FC<ToolbarProps> = ({
    onToolSelect,
    activeTool,
    onClear,
    onUndo,
    onDownload,
    activeColor,
    onColorChange,
    brushWidth,
    onBrushWidthChange
}) => {
    const [showStickers, setShowStickers] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showColors, setShowColors] = useState(false);

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-50">

            {/* Color Popover */}
            {showColors && (
                <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-2">
                    <div className="flex gap-2">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                className={cn(
                                    "w-6 h-6 rounded-full border border-gray-200 transition-transform hover:scale-125",
                                    activeColor === c && "ring-2 ring-offset-2 ring-blue-500"
                                )}
                                style={{ backgroundColor: c }}
                                onClick={() => {
                                    onColorChange(c);
                                    setShowColors(false);
                                }}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Brush Size: {brushWidth}px</label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={brushWidth}
                            onChange={(e) => onBrushWidthChange(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
            )}

            {/* Sticker Popover */}
            {showStickers && (
                <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 grid grid-cols-6 gap-2 mb-2 animate-in slide-in-from-bottom-2">
                    {STICKERS.map(s => (
                        <button
                            key={s}
                            className="text-2xl hover:scale-125 transition-transform p-1"
                            onClick={() => {
                                onToolSelect('sticker', s);
                                setShowStickers(false);
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Export Popover */}
            {showExport && (
                <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-2 flex flex-col gap-1 mb-2 animate-in slide-in-from-bottom-2 w-40">
                    <Button variant="ghost" size="sm" onClick={() => { onDownload(); setShowExport(false); }} className="justify-start gap-2 text-xs">
                        <Download size={14} /> Download Page
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { onToolSelect('export-pdf'); setShowExport(false); }} className="justify-start gap-2 text-xs">
                        <FileText size={14} /> Export PDF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { onToolSelect('export-ppt'); setShowExport(false); }} className="justify-start gap-2 text-xs">
                        <MonitorPlay size={14} /> Export PPT
                    </Button>
                </div>
            )}

            {/* Main Bar */}
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-6 py-3 flex gap-2 items-center transition-all hover:shadow-2xl">

                <Button
                    variant={activeTool === 'select' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolSelect('select')}
                    title="Select / Move"
                    className="rounded-full"
                >
                    <MousePointer size={18} />
                </Button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <button
                    onClick={() => setShowColors(!showColors)}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 active:scale-95 overflow-hidden group relative"
                    style={{ backgroundColor: activeColor }}
                    title="Color & Size"
                >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                        <Palette size={14} className="text-white" />
                    </div>
                </button>

                <Button
                    variant={activeTool === 'brush' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolSelect('brush')}
                    title="Brush"
                    className="rounded-full"
                >
                    <PenTool size={18} />
                </Button>

                <Button
                    variant={activeTool === 'eraser' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolSelect('eraser')}
                    title="Eraser"
                    className="rounded-full"
                >
                    <Eraser size={18} />
                </Button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <Button
                    variant={activeTool === 'text' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolSelect('text')}
                    title="Add Text"
                    className="rounded-full"
                >
                    <Type size={18} />
                </Button>

                <Button
                    variant={activeTool === 'image' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolSelect('image')}
                    title="Add Image"
                    className="rounded-full"
                >
                    <ImageIcon size={18} />
                </Button>

                <Button
                    variant={showStickers ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setShowStickers(!showStickers)}
                    title="Add Sticker"
                    className="rounded-full"
                >
                    <Sticker size={18} />
                </Button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <Button
                    variant={activeTool === 'rect' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolSelect('rect')}
                    title="Square"
                    className="rounded-full"
                >
                    <Square size={18} />
                </Button>

                <Button
                    variant={activeTool === 'circle' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolSelect('circle')}
                    title="Circle"
                    className="rounded-full"
                >
                    <Circle size={18} />
                </Button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <Button variant="ghost" size="icon" onClick={onUndo} title="Undo" className="rounded-full hover:bg-gray-100 text-gray-500">
                    <RotateCcw size={18} />
                </Button>

                <Button variant="ghost" size="icon" onClick={onClear} title="Clear Page" className="rounded-full hover:bg-red-50 hover:text-red-500 text-gray-500">
                    <Palette size={18} />
                </Button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <Button
                    variant={showExport ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setShowExport(!showExport)}
                    title="Export"
                    className="rounded-full hover:bg-blue-50 hover:text-blue-500 text-gray-500"
                >
                    <Download size={18} />
                </Button>
            </div>
        </div>
    );
};

export default Toolbar;
