import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJ8jCMTDRvvKHQ3ezwlhOcyQK3tTpDQfo",
  authDomain: "preventivi-smart.firebaseapp.com",
  databaseURL: "https://preventivi-smart-default-rtdb.firebaseio.com",
  projectId: "preventivi-smart",
  storageBucket: "preventivi-smart.firebasestorage.app",
  messagingSenderId: "292306670153",
  appId: "1:292306670153:web:42623bf882f3b98c1a2598"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
