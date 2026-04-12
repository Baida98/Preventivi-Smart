/**
 * Modulo Autenticazione Email/Password
 * Integrazione Firebase con UI semplificata
 */

import { auth } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// ===== STATE =====
let currentUser = null;
let authCallbacks = [];

// ===== LISTENER GLOBALE =====
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  notifyAuthCallbacks(user);
  
  if (user) {
    // Salva sessione locale
    localStorage.setItem('preventivi_user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      loginTime: new Date().toISOString()
    }));
  } else {
    localStorage.removeItem('preventivi_user');
  }
});

// ===== REGISTRAZIONE =====
export async function registerUser(email, password, displayName) {
  try {
    // Validazione
    if (!email || !password || !displayName) {
      throw new Error('Tutti i campi sono obbligatori');
    }
    
    if (password.length < 6) {
      throw new Error('La password deve avere almeno 6 caratteri');
    }
    
    if (!isValidEmail(email)) {
      throw new Error('Email non valida');
    }

    // Creazione account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Aggiornamento profilo
    await updateProfile(userCredential.user, {
      displayName: displayName
    });

    return {
      success: true,
      user: userCredential.user,
      message: 'Registrazione completata con successo!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// ===== LOGIN =====
export async function loginUser(email, password) {
  try {
    if (!email || !password) {
      throw new Error('Email e password sono obbligatori');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return {
      success: true,
      user: userCredential.user,
      message: 'Login effettuato con successo!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// ===== LOGOUT =====
export async function logoutUser() {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Logout effettuato'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== GETTER UTENTE CORRENTE =====
export function getCurrentUser() {
  return currentUser;
}

export function isUserLoggedIn() {
  return currentUser !== null;
}

// ===== SUBSCRIBE ALLE MODIFICHE =====
export function onAuthStateChange(callback) {
  authCallbacks.push(callback);
  
  // Chiama subito con lo stato corrente
  callback(currentUser);
  
  // Ritorna funzione di unsubscribe
  return () => {
    authCallbacks = authCallbacks.filter(cb => cb !== callback);
  };
}

function notifyAuthCallbacks(user) {
  authCallbacks.forEach(callback => callback(user));
}

// ===== VALIDAZIONE =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Minimo 6 caratteri');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Almeno una maiuscola');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Almeno un numero');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ===== RECUPERO SESSIONE =====
export function getStoredSession() {
  const stored = localStorage.getItem('preventivi_user');
  return stored ? JSON.parse(stored) : null;
}

export function clearStoredSession() {
  localStorage.removeItem('preventivi_user');
}
