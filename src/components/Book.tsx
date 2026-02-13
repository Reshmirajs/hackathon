"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Page from "./Page";
import CanvasEditor from "./CanvasEditor";
import Toolbar from "./Toolbar"; // Import Toolbar here

// Dynamic import for HTMLFlipBook
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

export default function Book() {
    const bookRef = useRef(null);
    const [mount, setMount] = useState(false);
    const [activeTool, setActiveTool] = useState('brush');
    const [toolPayload, setToolPayload] = useState<any>(null);
    const [activeColor, setActiveColor] = useState('#000000');
    const [brushWidth, setBrushWidth] = useState(3);
    const [bookId] = useState('demo-journal-vol1');

    useEffect(() => {
        setMount(true);
    }, []);

    const handleToolSelect = (tool: string, payload?: any) => {
        setActiveTool(tool);
        if (payload) setToolPayload(payload);

        if (['clear', 'download', 'undo', 'sticker'].includes(tool)) {
            setTimeout(() => {
                setActiveTool('select');
                setToolPayload(null);
            }, 200);
        }
    };

    if (!mount) return <div className="flex justify-center items-center h-screen">Loading Journal...</div>;

    return (
        <div className="flex justify-center items-center h-[85vh] w-full perspective-origin-center relative group">

            {/* Integrated Toolbar */}
            <Toolbar
                activeTool={activeTool}
                onToolSelect={handleToolSelect}
                onClear={() => handleToolSelect('clear')}
                onUndo={() => handleToolSelect('undo')}
                onDownload={() => handleToolSelect('download')}
                activeColor={activeColor}
                onColorChange={setActiveColor}
                brushWidth={brushWidth}
                onBrushWidthChange={setBrushWidth}
            />

            {/* @ts-ignore - Types for react-pageflip workaround */}
            <HTMLFlipBook
                width={450}
                height={650}
                size="fixed"
                minWidth={300}
                maxWidth={500}
                minHeight={400}
                maxHeight={700}
                showCover={true}
                mobileScrollSupport={true}
                className="demo-book shadow-2xl rounded-r-md"
                ref={bookRef}
                flippingTime={1000}
                usePortrait={true}
            >

                {/* Cover Page */}
                <Page number={0} className="bg-gradient-to-br from-indigo-50 to-blue-50 border-r-4 border-gray-300">
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-24 h-24 bg-gray-900 rounded-full mb-6 flex items-center justify-center shadow-lg">
                            <span className="text-4xl text-white font-serif">LJ</span>
                        </div>
                        <h1 className="text-4xl font-serif text-gray-800 mb-2">Lumin Journal</h1>
                        <p className="text-gray-500 font-light italic">Your collaborative space</p>
                        <div className="mt-12 text-xs text-gray-400 uppercase tracking-widest">
                            Vol. 1
                        </div>
                    </div>
                </Page>

                {/* Page 1: Introduction */}
                <Page number={1}>
                    <div className="p-8 font-serif leading-relaxed text-gray-700">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200">Preface</h2>
                        <p className="mb-4">
                            Welcome to your new digital journal. This space is designed for creativity, reflection, and collaboration.
                        </p>
                        <p>
                            Feel free to draw, write, and paste images on the following pages. Your changes are saved automatically.
                        </p>
                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                            <p>💡 Tip: Click "Text" then click anywhere on the page to type. Paste images directly or use the image button.</p>
                        </div>
                    </div>
                </Page>

                {/* Page 2: Canvas */}
                <Page number={2}>
                    <div className="h-full w-full relative">
                        <CanvasEditor
                            bookId={bookId}
                            pageId="page-2"
                            activeTool={activeTool}
                            toolPayload={toolPayload}
                            width={450}
                            height={650}
                            color={activeColor}
                            brushWidth={brushWidth}
                        />
                    </div>
                </Page>

                {/* Page 3: Canvas */}
                <Page number={3}>
                    <div className="h-full w-full relative">
                        <CanvasEditor
                            bookId={bookId}
                            pageId="page-3"
                            activeTool={activeTool}
                            toolPayload={toolPayload}
                            width={450}
                            height={650}
                            color={activeColor}
                            brushWidth={brushWidth}
                        />
                    </div>
                </Page>

                {/* Page 4: Canvas */}
                <Page number={4}>
                    <div className="h-full w-full relative">
                        <CanvasEditor
                            bookId={bookId}
                            pageId="page-4"
                            activeTool={activeTool}
                            toolPayload={toolPayload}
                            width={450}
                            height={650}
                            color={activeColor}
                            brushWidth={brushWidth}
                        />
                    </div>
                </Page>

                {/* Page 5: Canvas */}
                <Page number={5}>
                    <div className="h-full w-full relative">
                        <CanvasEditor
                            bookId={bookId}
                            pageId="page-5"
                            activeTool={activeTool}
                            toolPayload={toolPayload}
                            width={450}
                            height={650}
                            color={activeColor}
                            brushWidth={brushWidth}
                        />
                    </div>
                </Page>

                {/* Back Cover */}
                <Page number={6} className="bg-gray-100">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 font-serif text-sm">Lumin Journal &copy; 2024</p>
                    </div>
                </Page>

            </HTMLFlipBook>
        </div>
    );
}
