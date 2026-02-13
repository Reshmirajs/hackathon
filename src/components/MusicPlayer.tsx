"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, Music as MusicIcon, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Default lofi track
const DEFAULT_TRACK = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";

export default function MusicPlayer({ bookId = "demo-journal-vol1" }: { bookId?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isRemoteUpdate = useRef(false);

    // Sync with Firestore
    useEffect(() => {
        if (!db) return; // Safely exit if db is not initialized

        const docRef = doc(db, 'books', bookId, 'state', 'music');

        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data) {
                    // If remote state is different from local state
                    if (data.isPlaying !== isPlaying) {
                        isRemoteUpdate.current = true;
                        if (data.isPlaying) {
                            audioRef.current?.play().catch(() => {
                                // Autoplay policy might block this if user hasn't interacted
                                console.log("Autoplay blocked");
                            });
                        } else {
                            audioRef.current?.pause();
                        }
                        setIsPlaying(data.isPlaying);

                        // Sync time if significantly different (e.g. > 2 seconds)
                        if (audioRef.current && Math.abs(audioRef.current.currentTime - data.currentTime) > 2) {
                            audioRef.current.currentTime = data.currentTime;
                        }

                        setTimeout(() => {
                            isRemoteUpdate.current = false;
                        }, 500);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [bookId, isPlaying]); // Added isPlaying dependency to avoid stale closure if needed, though ref usage covers most

    const togglePlay = async () => {
        if (!audioRef.current) return;

        const newState = !isPlaying;
        setIsPlaying(newState); // Optimistic update

        if (newState) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }

        // Sync to Firestore
        if (db) {
            try {
                const docRef = doc(db, 'books', bookId, 'state', 'music');
                await setDoc(docRef, {
                    isPlaying: newState,
                    currentTime: audioRef.current.currentTime,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
            } catch (e) {
                console.error("Error syncing music:", e);
            }
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
        }
    }, []);

    return (
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-sm border border-white/20 transition-all hover:bg-white/20">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 rounded-lg">
                <MusicIcon className="text-indigo-600" size={24} />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-700">Lofi Vibes</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    {isPlaying ? <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                    {isPlaying ? "Syncing..." : "Paused"}
                </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="icon" onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0; }} className="h-8 w-8 text-gray-600 hover:text-indigo-600">
                    <SkipBack size={16} />
                </Button>
                <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="icon"
                    onClick={togglePlay}
                    className={`h-10 w-10 rounded-full shadow-md transition-all active:scale-95 ${isPlaying ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white hover:bg-gray-50'}`}
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1 text-gray-700" />}
                </Button>
            </div>

            <audio ref={audioRef} src={DEFAULT_TRACK} loop />
        </div>
    );
}
