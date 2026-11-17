import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Real Firebase Project Configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCLzEgD58zc0B1vAEGgObjijEa_qtcmJ4o",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "blog-portfolio-54dde.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "blog-portfolio-54dde",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "blog-portfolio-54dde.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "886686686487",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:886686686487:web:9ae9913d38e0e94bcb6b52",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-V3W23XFP8T"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export default app;
