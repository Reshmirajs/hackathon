"use client";

import Book from '@/components/Book';
import MusicPlayer from '@/components/MusicPlayer';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function JournalPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center py-8">
            {/* Header */}
            <div className="w-full max-w-6xl flex justify-between items-center px-8 mb-4">
                <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium">
                    <Home size={18} />
                    <span>Lumin</span>
                </Link>
                <div className="flex items-center gap-4">
                    <MusicPlayer />
                    <div className="text-sm text-gray-400 font-mono bg-gray-100 px-3 py-1 rounded-full">
                        ID: {id}
                    </div>
                </div>
            </div>

            {/* The Book */}
            <div className="flex-1 w-full flex items-center justify-center p-4">
                <Book />
            </div>

            {/* Footer / Instructions */}
            <div className="mt-8 text-gray-400 text-xs text-center pb-8 animate-pulse">
                Auto-saving to cloud...
            </div>
        </div>
    );
}
