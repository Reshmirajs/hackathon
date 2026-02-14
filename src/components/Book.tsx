"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Page from "./Page";
import CanvasEditor from "./CanvasEditor";

// Dynamic import for HTMLFlipBook
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

interface BookProps {
    activeTool: string;
    toolPayload: any;
    activeColor: string;
    brushWidth: number;
}

export default function Book({
    activeTool,
    toolPayload,
    activeColor,
    brushWidth
}: BookProps) {

    const bookRef = useRef(null);
    const [mount, setMount] = useState(false);
    const [bookId] = useState('demo-journal-vol1');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages] = useState(7);

    useEffect(() => {
        setMount(true);
    }, []);

    const handleFlip = (e: any) => {
        setCurrentPage(e.data);
    };

    if (!mount) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-serif">Loading your journal...</p>
                </div>
            </div>
        );
    }

    const isPageActive = (pageNum: number) => {
        if (currentPage === 0) return pageNum === 0;
        return pageNum === currentPage || pageNum === currentPage + 1;
    };

    const flipNext = () => {
        (bookRef.current as any)?.pageFlip()?.flipNext();
    };

    const flipPrev = () => {
        (bookRef.current as any)?.pageFlip()?.flipPrev();
    };

    return (
        <div className="flex justify-center items-center h-[85vh] w-full perspective-origin-center relative group">

            {/* Page indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-gray-200/60">
                <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span className="text-xs font-medium text-gray-700">
                        Page {currentPage} of {totalPages - 1}
                    </span>
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentPage
                                    ? 'bg-indigo-600 w-6'
                                    : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative">
                {/* @ts-ignore */}
                <HTMLFlipBook
                    width={450}
                    height={650}
                    size="fixed"
                    minWidth={300}
                    maxWidth={500}
                    minHeight={400}
                    maxHeight={700}
                    showCover={true}
                    mobileScrollSupport={false}
                    useMouseEvents={false}
                    swipeDistance={50}
                    className="demo-book shadow-2xl rounded-r-md"
                    ref={bookRef}
                    flippingTime={800}
                    usePortrait={false}
                    startPage={0}
                    onFlip={handleFlip}
                    clickEventForward={false}
                    disableFlipByClick={true}
                >
                    {/* Cover Page */}
                    <Page number={0} className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border-r-4 border-indigo-200">
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 relative">
                            <div className="absolute top-8 left-8 w-16 h-16 border-2 border-indigo-200 rounded-full opacity-30"></div>
                            <div className="absolute bottom-8 right-8 w-12 h-12 border-2 border-purple-200 rounded-full opacity-30"></div>

                            <div className="w-28 h-28 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-6 flex items-center justify-center shadow-2xl relative">
                                <span className="text-5xl text-white font-serif font-bold">LJ</span>
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                            </div>

                            <h1 className="text-5xl font-serif font-bold text-gray-900 mb-3 tracking-tight">
                                Lumin Journal
                            </h1>
                            <p className="text-gray-600 font-light italic mb-2">Your collaborative space</p>
                            <p className="text-sm text-gray-500">Where ideas come to life</p>

                            <div className="mt-16 space-y-2">
                                <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                                    Volume 1
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <ChevronRight size={12} />
                                    <span>Flip to begin your journey</span>
                                </div>
                            </div>
                        </div>
                    </Page>

                    {/* Page 1: Introduction */}
                    <Page number={1}>
                        <div className="p-8 font-serif leading-relaxed text-gray-700 h-full flex flex-col">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-transparent rounded-full"></div>
                                    <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
                                </div>

                                <p className="mb-4 text-sm leading-relaxed">
                                    Welcome to your new digital journal. This is a space designed for <span className="font-semibold text-indigo-600">creativity</span>, <span className="font-semibold text-purple-600">reflection</span>, and <span className="font-semibold text-blue-600">collaboration</span>.
                                </p>

                                <p className="text-sm mb-6 leading-relaxed">
                                    Feel free to draw, write, and express yourself on the following pages. Your changes are saved automatically.
                                </p>

                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">💡</div>
                                        <div>
                                            <p className="text-xs font-semibold text-amber-900 mb-1">How to Draw</p>
                                            <p className="text-xs text-amber-800 leading-relaxed">
                                                Click the <strong>Brush icon</strong> in the toolbar, then click and drag on any canvas page to draw!
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                        Quick Features
                                    </h3>
                                    <ul className="space-y-2 text-xs text-gray-600 ml-4">
                                        <li className="flex items-start gap-2">
                                            <span className="text-indigo-500 font-bold">•</span>
                                            <span><strong>Draw</strong> with customizable brushes and colors</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-500 font-bold">•</span>
                                            <span><strong>Add & drag text</strong> anywhere on the page</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 font-bold">•</span>
                                            <span><strong>Drag stickers</strong> to position them</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-500 font-bold">•</span>
                                            <span><strong>Upload images</strong> and move them around</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-200">
                                <p className="text-[10px] text-gray-400 italic text-center">
                                    Created with ❤️ for creative minds
                                </p>
                            </div>
                        </div>
                    </Page>

                    {/* Page 2: Canvas */}
                    <Page number={2} fullBleed>
                        <div className="h-full w-full relative">
                            <CanvasEditor
                                bookId={bookId}
                                pageId="page-2"
                                activeTool={activeTool}
                                toolPayload={toolPayload}
                                activePageId={isPageActive(2) ? "page-2" : "inactive"}
                                width={450}
                                height={650}
                                color={activeColor}
                                brushWidth={brushWidth}
                            />
                        </div>
                    </Page>

                    {/* Page 3: Canvas */}
                    <Page number={3} fullBleed>
                        <div className="h-full w-full relative">
                            <CanvasEditor
                                bookId={bookId}
                                pageId="page-3"
                                activeTool={activeTool}
                                toolPayload={toolPayload}
                                activePageId={isPageActive(3) ? "page-3" : "inactive"}
                                width={450}
                                height={650}
                                color={activeColor}
                                brushWidth={brushWidth}
                            />
                        </div>
                    </Page>

                    {/* Page 4: Canvas */}
                    <Page number={4} fullBleed>
                        <div className="h-full w-full relative">
                            <CanvasEditor
                                bookId={bookId}
                                pageId="page-4"
                                activeTool={activeTool}
                                toolPayload={toolPayload}
                                activePageId={isPageActive(4) ? "page-4" : "inactive"}
                                width={450}
                                height={650}
                                color={activeColor}
                                brushWidth={brushWidth}
                            />
                        </div>
                    </Page>

                    {/* Page 5: Canvas */}
                    <Page number={5} fullBleed>
                        <div className="h-full w-full relative">
                            <CanvasEditor
                                bookId={bookId}
                                pageId="page-5"
                                activeTool={activeTool}
                                toolPayload={toolPayload}
                                activePageId={isPageActive(5) ? "page-5" : "inactive"}
                                width={450}
                                height={650}
                                color={activeColor}
                                brushWidth={brushWidth}
                            />
                        </div>
                    </Page>

                    {/* Back Cover */}
                    <Page number={6} className="bg-gradient-to-br from-gray-100 via-gray-50 to-slate-100">
                        <div className="flex flex-col items-center justify-center h-full relative">
                            <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-gray-300 rounded-tl-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-3xl"></div>

                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
                                    <span className="text-2xl text-white font-serif italic">L</span>
                                </div>
                                <p className="text-gray-600 font-serif text-sm font-medium">Lumin Journal</p>
                                <p className="text-gray-400 text-xs">© 2026 • All rights reserved</p>
                            </div>

                            <div className="absolute bottom-8 left-0 right-0 text-center">
                                <p className="text-[10px] text-gray-400 italic">Thank you for journaling with us</p>
                            </div>
                        </div>
                    </Page>

                </HTMLFlipBook>

                {/* Navigation Controls */}
                <div className="absolute bottom-6 right-6 z-40 flex items-center gap-3">
                    <button
                        onClick={flipPrev}
                        disabled={currentPage === 0}
                        className="group bg-white/95 hover:bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-gray-100 hover:scale-110 active:scale-95"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={20} className="text-gray-700 group-hover:text-indigo-600 transition-colors" />
                    </button>

                    <button
                        onClick={flipNext}
                        disabled={currentPage >= totalPages - 1}
                        className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 p-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                        aria-label="Next Page"
                    >
                        <ChevronRight size={20} className="text-white" />
                    </button>
                </div>

                {/* Keyboard hint */}
                <div className="absolute bottom-20 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                        <p className="whitespace-nowrap">Use ← → keys to flip pages</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
