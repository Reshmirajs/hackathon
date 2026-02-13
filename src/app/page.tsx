"use client";

import { useState } from "react";
import Book from '@/components/Book';
import MusicPlayer from '@/components/MusicPlayer';
import { Button } from "@/components/ui/button"; // Assuming we will add ui components
import Link from 'next/link';
import { PenTool, Notebook, Share2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[#fdfbf7]">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Lumin Journal
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center get-started-gradient lg:static lg:h-auto lg:w-auto lg:bg-none">
          <MusicPlayer />
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        {/* Book content will go here */}
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-6xl font-serif text-gray-800 tracking-tight">Your Digital Canvas</h1>
          <p className="text-lg text-gray-600 max-w-md text-center">
            A minimalist, collaborative space for thoughts, sketches, and memories.
          </p>
          <div className="flex gap-4">
            <Link href="/journal/demo" className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition shadow-lg flex items-center gap-2">
              <PenTool size={18} />
              Start Creating
            </Link>
            <button className="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:border-gray-400 transition shadow-sm flex items-center gap-2">
              <Share2 size={18} />
              Collaborate
            </button>
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:max-w-5xl lg:w-full lg:grid-cols-4 lg:text-left">
        {/* Features list */}

      </div>
    </main>
  );
}
