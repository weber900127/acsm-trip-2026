import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCPt2M4p5y-dDjNefu_Hq4vcyiKKN6Nmd8",
    authDomain: "acsm-trip-2026.firebaseapp.com",
    projectId: "acsm-trip-2026",
    storageBucket: "acsm-trip-2026.firebasestorage.app",
    messagingSenderId: "90847137220",
    appId: "1:90847137220:web:3f158196c5046666e96891",
    measurementId: "G-YV63KV6GPT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
