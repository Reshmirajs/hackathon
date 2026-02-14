import { useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollaboration(bookId: string, pageId: string, canvas: any) {
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        if (!bookId || !pageId || !canvas || !db) return;

        const docRef = doc(db, 'books', bookId, 'pages', pageId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && !docSnap.metadata.hasPendingWrites) {
                const data = docSnap.data();
                if (data?.canvasJSON) {
                    isRemoteUpdate.current = true;

                    // canvasJSON is stored as a string to avoid Firestore's
                    // "nested arrays not supported" error from Fabric.js path data
                    const canvasData = typeof data.canvasJSON === 'string'
                        ? JSON.parse(data.canvasJSON)
                        : data.canvasJSON;

                    const currentJson = JSON.stringify(canvas.toJSON());
                    const newJson = JSON.stringify(canvasData);

                    if (currentJson !== newJson) {
                        canvas.loadFromJSON(canvasData, () => {
                            canvas.requestRenderAll();
                            setTimeout(() => {
                                isRemoteUpdate.current = false;
                            }, 500);
                        });
                    } else {
                        isRemoteUpdate.current = false;
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [bookId, pageId, canvas]);

    const saveCanvas = async () => {
        if (isRemoteUpdate.current || !canvas || !db) return;

        const json = canvas.toJSON();
        if (JSON.stringify(json) === '{}') return;

        try {
            const docRef = doc(db, 'books', bookId, 'pages', pageId);
            // Store as a JSON string to avoid Firestore's nested array restriction.
            // Fabric.js path data contains nested arrays like [[x,y], [x,y], ...]
            // which Firestore does not support.
            await setDoc(docRef, {
                canvasJSON: JSON.stringify(json),
                lastUpdated: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error("Sync error (maybe check env vars?):", e);
        }
    };

    return { saveCanvas, isRemoteUpdate };
}
