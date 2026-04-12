// Firebase SDK (Web App)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBJ8jCMTDRvvKHQ3ezwlhOcyQK3tTpDQfo",
  authDomain: "preventivi-smart.firebaseapp.com",
  databaseURL: "https://preventivi-smart-default-rtdb.firebaseio.com",
  projectId: "preventivi-smart",
  storageBucket: "preventivi-smart.firebasestorage.app",
  messagingSenderId: "292306670153",
  appId: "1:292306670153:web:42623bf882f3b98c1a2598",
  measurementId: "G-MFM7NPFNZ5"
};

// INIT APP
const app = initializeApp(firebaseConfig);

// SERVICES
const analytics = getAnalytics(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// EXPORT (per usare nei tuoi file)
export { app, analytics, db, rtdb };
