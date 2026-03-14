import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBVEdmXkIHsu-XOuyVIZYDYiyIss2FGQRg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "arlyon-b51cf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "arlyon-b51cf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "arlyon-b51cf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "559465265358",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:559465265358:web:8f80a9f66d069feea4789f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VPJH5Q25QZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
export default app;
