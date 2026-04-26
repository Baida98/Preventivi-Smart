import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJ8jCMTDRvvKHQ3ezwlhOcyQK3tTpDQfo",
  authDomain: "preventivi-smart.firebaseapp.com",
  projectId: "preventivi-smart",
  storageBucket: "preventivi-smart.firebasestorage.app",
  messagingSenderId: "292306670153",
  appId: "1:292306670153:web:42623bf882f3b98c1a2598"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
