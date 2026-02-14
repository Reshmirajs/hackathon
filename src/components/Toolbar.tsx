"use client";

import React, { useState } from 'react';
import { PenTool, Type, Image as ImageIcon, RotateCcw, Download, Palette, MousePointer, Sticker, FileText, MonitorPlay, Square, Circle, Eraser, Trash2, Sparkles } from 'lucide-react';
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
    '⭐', '❤️', '🔥', '💡', '✅', '🎉', '📌', '💭', '🌈', '🎨', 
    '📚', '✨', '🌟', '💫', '🎯', '🚀', '💪', '👍', '✌️', '🙌',
    '😊', '😎', '🤔', '😍', '🥳', '🎭', '🎪', '🎸', '🎵', '🎤',
    '☕', '🍕', '🍰', '🎂', '🍦', '🌸', '🌺', '🌻', '🌷', '🌹',
    '🦋', '🐝', '🌙', '☀️', '⚡', '🌊', '🏔️', '🎈', '🎁', '🎀'
];

const COLORS = [
    '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff',
    '#ef4444', '#f97316', '#f59e0b', '#fbbf24', '#facc15', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#991b1b', '#92400e', '#78350f', '#713f12', '#365314',
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

    const tools = [
        { id: 'select', icon: MousePointer, label: 'Select / Move', color: 'text-gray-700' },
        { id: 'brush', icon: PenTool, label: 'Brush', color: 'text-blue-600' },
        { id: 'eraser', icon: Eraser, label: 'Eraser', color: 'text-red-500' },
        { id: 'text', icon: Type, label: 'Add Text', color: 'text-purple-600' },
        { id: 'image', icon: ImageIcon, label: 'Add Image', color: 'text-green-600' },
        { id: 'rect', icon: Square, label: 'Rectangle', color: 'text-orange-600' },
        { id: 'circle', icon: Circle, label: 'Circle', color: 'text-pink-600' },
    ];

    return (
        <div className="flex items-center gap-4 z-50">
            <div className="flex flex-col items-center gap-2 relative left-toolbar">
                {/* Decorative glow */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-3 h-48 rounded-full bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 shadow-2xl blur-md opacity-70 pointer-events-none animate-pulse" />
                
                {/* Color Popover */}
                {showColors && (
                    <div className="absolute left-full ml-6 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-left-2 w-72 z-50">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Palette size={16} className="text-indigo-600" />
                                Colors & Brush
                            </h3>
                            <button
                                onClick={() => setShowColors(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Color Grid */}
                        <div className="grid grid-cols-6 gap-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    className={cn(
                                        "w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 active:scale-95",
                                        activeColor === c 
                                            ? "ring-2 ring-offset-2 ring-indigo-500 border-indigo-300 scale-110" 
                                            : "border-gray-200 hover:border-gray-300"
                                    )}
                                    style={{ backgroundColor: c }}
                                    onClick={() => onColorChange(c)}
                                    title={c}
                                />
                            ))}
                        </div>

                        {/* Custom Color Picker */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                            <input
                                aria-label="Custom color"
                                type="color"
                                value={activeColor}
                                onChange={(e) => onColorChange(e.target.value)}
                                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-300"
                            />
                            <div className="flex-1">
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Custom Color</label>
                                <input
                                    type="text"
                                    value={activeColor}
                                    onChange={(e) => onColorChange(e.target.value)}
                                    className="text-sm w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        {/* Brush Size */}
                        <div className="flex flex-col gap-3 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-indigo-900 font-bold uppercase tracking-wider">
                                    Brush Size
                                </label>
                                <span className="text-sm font-bold text-indigo-600 bg-white px-3 py-1 rounded-full">
                                    {brushWidth}px
                                </span>
                            </div>
                            <input
                                type="range"
                                title=''
                                placeholder='teat'
                                min="1"
                                max="50"
                                value={brushWidth}
                                onChange={(e) => onBrushWidthChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>Fine</span>
                                <span>Thick</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sticker Popover */}
                {showStickers && (
                    <div className="absolute left-full ml-6 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-5 animate-in slide-in-from-left-2 w-80 max-h-96 z-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles size={16} className="text-pink-600" />
                                Stickers
                            </h3>
                            <button
                                onClick={() => setShowStickers(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-8 gap-2 overflow-y-auto max-h-72">
                            {STICKERS.map(s => (
                                <button
                                    key={s}
                                    className="text-3xl hover:scale-125 transition-transform p-2 hover:bg-gray-100 rounded-xl active:scale-95"
                                    onClick={() => {
                                        onToolSelect('sticker', s);
                                        setShowStickers(false);
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Export Popover */}
                {showExport && (
                    <div className="absolute left-full ml-6 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 animate-in slide-in-from-left-2 w-52 z-50">
                        <h3 className="text-xs font-bold text-gray-700 px-2 mb-1">Export Options</h3>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { onDownload(); setShowExport(false); }} 
                            className="justify-start gap-3 text-sm hover:bg-indigo-50 hover:text-indigo-700 rounded-xl"
                        >
                            <Download size={16} /> Download Page
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { onToolSelect('export-pdf'); setShowExport(false); }} 
                            className="justify-start gap-3 text-sm hover:bg-purple-50 hover:text-purple-700 rounded-xl"
                        >
                            <FileText size={16} /> Export as PDF
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { onToolSelect('export-ppt'); setShowExport(false); }} 
                            className="justify-start gap-3 text-sm hover:bg-pink-50 hover:text-pink-700 rounded-xl"
                        >
                            <MonitorPlay size={16} /> Export as PPT
                        </Button>
                    </div>
                )}

                {/* Main Toolbar */}
                <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-200/80 shadow-2xl rounded-3xl py-6 px-3 flex flex-col gap-2 items-center transition-all hover:shadow-indigo-100/50 hover:border-indigo-200/50 left-toolbar-panel">
                    
                    {/* Color Indicator Button */}
                    <button
                        onClick={() => {
                            setShowColors(!showColors);
                            setShowStickers(false);
                            setShowExport(false);
                        }}
                        className="relative w-11 h-11 rounded-2xl border-3 border-white shadow-lg transition-all hover:scale-110 active:scale-95 overflow-hidden group mb-2"
                        style={{ backgroundColor: activeColor }}
                        title="Color & Brush Size"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                            <Palette size={18} className="text-white drop-shadow" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
                    </button>

                    <div className="w-9 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto my-1" />

                    {/* Tool Buttons */}
                    {tools.map((tool) => (
                        <Button
                            key={tool.id}
                            variant={activeTool === tool.id ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => {
                                onToolSelect(tool.id);
                                if (tool.id === 'brush') {
                                    setShowColors(true);
                                    setShowStickers(false);
                                    setShowExport(false);
                                }
                            }}
                            title={tool.label}
                            className={cn(
                                "rounded-2xl w-11 h-11 transition-all hover:scale-105 active:scale-95",
                                activeTool === tool.id 
                                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700" 
                                    : "hover:bg-gray-100"
                            )}
                        >
                            <tool.icon size={20} className={activeTool === tool.id ? 'text-white' : tool.color} />
                        </Button>
                    ))}

                    <div className="w-9 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto my-1" />

                    {/* Sticker Button */}
                    <Button
                        variant={showStickers ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => {
                            setShowStickers(!showStickers);
                            setShowColors(false);
                            setShowExport(false);
                        }}
                        title="Add Sticker"
                        className={cn(
                            "rounded-2xl w-11 h-11 transition-all hover:scale-105 active:scale-95",
                            showStickers 
                                ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg" 
                                : "hover:bg-gray-100"
                        )}
                    >
                        <Sticker size={20} className={showStickers ? 'text-white' : 'text-pink-600'} />
                    </Button>

                    <div className="w-9 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto my-1" />

                    {/* Action Buttons */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onUndo} 
                        title="Undo" 
                        className="rounded-2xl w-11 h-11 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95"
                    >
                        <RotateCcw size={20} />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClear} 
                        title="Clear Page" 
                        className="rounded-2xl w-11 h-11 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-105 active:scale-95"
                    >
                        <Trash2 size={20} />
                    </Button>

                    <div className="w-9 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto my-1" />

                    {/* Export Button */}
                    <Button
                        variant={showExport ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => {
                            setShowExport(!showExport);
                            setShowColors(false);
                            setShowStickers(false);
                        }}
                        title="Export"
                        className={cn(
                            "rounded-2xl w-11 h-11 transition-all hover:scale-105 active:scale-95",
                            showExport 
                                ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg" 
                                : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                    >
                        <Download size={20} />
                    </Button>
                </div>

                {/* Tooltip hint */}
                <div className="mt-2 text-[10px] text-gray-400 text-center max-w-[100px] leading-tight">
                    Click tools to select
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
