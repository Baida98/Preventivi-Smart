/**
 * Preventivi-Smart Pro — Autenticazione v6.0
 * Firebase Auth: Email/Password + Google Sign-In
 */

import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

let currentUser = null;
let authCallbacks = [];

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  notifyAuthCallbacks(user);
  if (user) {
    localStorage.setItem("preventivi_user", JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      loginTime: new Date().toISOString()
    }));
  } else {
    localStorage.removeItem("preventivi_user");
  }
});

// ===== REGISTRAZIONE =====
export async function registerUser(email, password, displayName) {
  try {
    if (!email || !password || !displayName) throw new Error("Tutti i campi sono obbligatori");
    if (password.length < 6) throw new Error("La password deve avere almeno 6 caratteri");
    if (!isValidEmail(email)) throw new Error("Email non valida");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: translateError(error) };
  }
}

// ===== LOGIN EMAIL =====
export async function loginUser(email, password) {
  try {
    if (!email || !password) throw new Error("Email e password sono obbligatori");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: translateError(error) };
  }
}

// ===== LOGIN GOOGLE =====
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: translateError(error) };
  }
}

// ===== LOGOUT =====
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getCurrentUser() { return currentUser; }
export function isUserLoggedIn() { return currentUser !== null; }

export function onAuthStateChange(callback) {
  authCallbacks.push(callback);
  callback(currentUser);
  return () => { authCallbacks = authCallbacks.filter(cb => cb !== callback); };
}

function notifyAuthCallbacks(user) {
  authCallbacks.forEach(cb => cb(user));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function translateError(error) {
  const map = {
    "auth/user-not-found":         "Nessun account trovato con questa email.",
    "auth/wrong-password":         "Password errata. Riprova.",
    "auth/email-already-in-use":   "Email già registrata. Prova ad accedere.",
    "auth/weak-password":          "Password troppo debole (min. 6 caratteri).",
    "auth/invalid-email":          "Formato email non valido.",
    "auth/too-many-requests":      "Troppi tentativi. Attendi qualche minuto.",
    "auth/popup-closed-by-user":   "Finestra Google chiusa. Riprova.",
    "auth/network-request-failed": "Errore di rete. Controlla la connessione.",
    "auth/invalid-credential":     "Credenziali non valide. Controlla email e password."
  };
  return map[error.code] || error.message;
}

export function getStoredSession() {
  const stored = localStorage.getItem("preventivi_user");
  return stored ? JSON.parse(stored) : null;
}

export function clearStoredSession() {
  localStorage.removeItem("preventivi_user");
}
