import { useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollaboration(bookId: string, pageId: string, canvas: any) {
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        if (!bookId || !pageId || !canvas || !db) return; // Hook safely returns if db is unavailable

        const docRef = doc(db, 'books', bookId, 'pages', pageId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data?.canvasJSON) {
                    isRemoteUpdate.current = true;
                    canvas.loadFromJSON(data.canvasJSON, () => {
                        canvas.requestRenderAll();
                        setTimeout(() => {
                            isRemoteUpdate.current = false;
                        }, 500);
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [bookId, pageId, canvas]);

    const saveCanvas = async () => {
        if (isRemoteUpdate.current || !canvas || !db) return; // Prevent save if db is missing

        // Standard serialization
        const json = canvas.toJSON();
        if (JSON.stringify(json) === '{}') return;

        try {
            const docRef = doc(db, 'books', bookId, 'pages', pageId);
            await setDoc(docRef, {
                canvasJSON: json,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error("Sync error (maybe check env vars?):", e);
        }
    };

    return { saveCanvas, isRemoteUpdate };
}
