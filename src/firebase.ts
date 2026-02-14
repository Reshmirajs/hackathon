// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Import other services like getFirestore if needed

const firebaseConfig = {
  apiKey: "AIzaSyCytEGqorJcdCVu0WjnI5eQzVMNAdp1ye4",
  authDomain: "journal-102c7.firebaseapp.com",
  projectId: "journal-102c7",
  storageBucket: "journal-102c7.firebasestorage.app",
  messagingSenderId: "523700226085",
  appId: "1:523700226085:web:a3f8547c7149bb709417cc",
  measurementId: "G-61WGLFX12J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Export other services as needed