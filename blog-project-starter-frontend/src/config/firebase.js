import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration from environment variables or defaults
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDummyKeyForPortfolioProject123456",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "blog-portfolio-errormakesclever.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "blog-portfolio-errormakesclever",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "blog-portfolio-errormakesclever.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:102938475610:web:123456abcdef7890"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export default app;
