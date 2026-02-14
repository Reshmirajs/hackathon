// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
// Falls back to demo config when env vars not set (for local demo)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCytEGqorJcdCVu0WjnI5eQzVMNAdp1ye4",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "journal-102c7.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "journal-102c7",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "journal-102c7.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "523700226085",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:523700226085:web:a3f8547c7149bb709417cc",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-61WGLFX12J"
};

// Check if config is valid
const isConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

// Initialize Firebase
let app: any = null;
let db: any = null;
let storage: any = null;
let auth: any = null;

if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'test') { // Ensure we run this logic
    if (isConfigured) {
        try {
            app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            db = getFirestore(app);
            storage = getStorage(app);
            auth = getAuth(app);
        } catch (e) {
            console.error("Firebase initialization failed:", e);
        }
    } else {
        console.warn("Firebase configuration missing. Set environment variables to enable collaboration.");
    }
}

export { app, db, storage, auth };
