// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaLr9NcRJUqKUKt9Yor9ezyU1FjTs-2Ls",
  authDomain: "livenyc-12314.firebaseapp.com",
  projectId: "livenyc-12314",
  storageBucket: "livenyc-12314.firebasestorage.app",
  messagingSenderId: "608337819244",
  appId: "1:608337819244:web:d5e6281bddcd905fb64a49",
  measurementId: "G-W0BRSH5S0V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics is optional and might not work in all environments
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics not available in this environment");
}

// Initialize Firestore
const db = getFirestore(app);

export { db };