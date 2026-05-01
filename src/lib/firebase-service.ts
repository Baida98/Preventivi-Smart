import {
  initializeApp,
  type FirebaseApp,
} from "firebase/app";
import {
  getAuth,
  type Auth,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import {
  getFirestore,
  type Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  type Transaction,
  Timestamp,
} from "firebase/firestore";
import type { Quote, CreateQuoteResponse, Service } from "./quote-model";
import { calculateTotal, formatQuoteNumber } from "./quote-model";

/**
 * Configurazione Firebase (da impostare con le credenziali reali)
 * NOTA: Queste sono placeholder - devono essere sostituite con le credenziali reali
 */
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || "",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Inizializza Firebase se non è già stato inizializzato
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { app: app!, auth: auth!, db: db! };
}

/**
 * Ottiene l'istanza di Firestore
 */
export function getFirestoreInstance(): Firestore {
  if (!db) {
    initializeFirebase();
  }
  return db!;
}

/**
 * Ottiene l'istanza di Auth
 */
export function getAuthInstance(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth!;
}

/**
 * Ascolta i cambiamenti dello stato di autenticazione
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const authInstance = getAuthInstance();
  return onAuthStateChanged(authInstance, callback);
}

/**
 * Accedi con Google
 */
export async function signInWithGoogle(): Promise<User> {
  const authInstance = getAuthInstance();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(authInstance, provider);
  return result.user;
}

/**
 * Esci dall'account
 */
export async function signOutUser(): Promise<void> {
  const authInstance = getAuthInstance();
  await signOut(authInstance);
}

/**
 * Ottiene l'utente corrente
 */
export function getCurrentUser(): User | null {
  const authInstance = getAuthInstance();
  return authInstance.currentUser;
}

/**
 * Crea un nuovo preventivo con numerazione automatica
 * Usa una transazione per garantire l'atomicità
 */
export async function createQuote(
  userId: string,
  quoteData: Omit<Quote, "id" | "numero" | "createdAt">
): Promise<CreateQuoteResponse> {
  const db = getFirestoreInstance();

  return runTransaction(db, async (transaction: Transaction) => {
    const userRef = doc(db, "users", userId);
    const counterRef = doc(userRef, "counters", "quotes");

    // Leggi il contatore corrente
    const counterSnap = await transaction.get(counterRef);
    const currentYear = new Date().getFullYear();
    let currentCounter = 0;

    if (counterSnap.exists()) {
      const data = counterSnap.data();
      // Se il contatore è dello stesso anno, incrementa
      if (data.year === currentYear) {
        currentCounter = data.sequence;
      }
      // Altrimenti reset a 0 (nuovo anno)
    }

    // Incrementa il contatore
    const nextSequence = currentCounter + 1;
    const numero = formatQuoteNumber(currentYear, nextSequence);

    // Aggiorna il contatore
    transaction.set(
      counterRef,
      {
        year: currentYear,
        sequence: nextSequence,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Crea il nuovo preventivo
    const quoteId = generateDocumentId();
    const now = Timestamp.now();
    const newQuote: Quote = {
      ...quoteData,
      id: quoteId,
      numero,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };

    const quoteRef = doc(userRef, "quotes", quoteId);
    transaction.set(quoteRef, newQuote);

    return {
      id: quoteId,
      numero,
      createdAt: newQuote.createdAt,
    };
  });
}

/**
 * Ottiene un preventivo per ID
 */
export async function getQuote(userId: string, quoteId: string): Promise<Quote | null> {
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);
  const quoteRef = doc(userRef, "quotes", quoteId);

  const snap = await getDoc(quoteRef);
  return snap.exists() ? (snap.data() as Quote) : null;
}

/**
 * Ottiene tutti i preventivi dell'utente
 */
export async function getUserQuotes(userId: string): Promise<Quote[]> {
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);
  const quotesRef = collection(userRef, "quotes");

  const q = query(quotesRef, orderBy("data", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => doc.data() as Quote);
}

/**
 * Ottiene i preventivi recenti dell'utente (ultimi N)
 */
export async function getRecentQuotes(userId: string, count: number = 10): Promise<Quote[]> {
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);
  const quotesRef = collection(userRef, "quotes");

  const q = query(
    quotesRef,
    orderBy("data", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);

  return snap.docs.map((doc) => doc.data() as Quote);
}

/**
 * Aggiorna un preventivo
 */
export async function updateQuote(
  userId: string,
  quoteId: string,
  updates: Partial<Quote>
): Promise<void> {
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);
  const quoteRef = doc(userRef, "quotes", quoteId);

  // Ricalcola il totale se ci sono servizi
  const dataToUpdate = { ...updates };
  if (updates.servizi) {
    dataToUpdate.totale = calculateTotal(updates.servizi);
  }

  dataToUpdate.updatedAt = new Date().toISOString();

  await updateDoc(quoteRef, dataToUpdate);
}

/**
 * Elimina un preventivo
 */
export async function deleteQuote(userId: string, quoteId: string): Promise<void> {
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);
  const quoteRef = doc(userRef, "quotes", quoteId);

  await deleteDoc(quoteRef);
}

/**
 * Aggiunge un servizio a un preventivo
 */
export async function addServiceToQuote(
  userId: string,
  quoteId: string,
  service: Service
): Promise<void> {
  const db = getFirestoreInstance();
  const quote = await getQuote(userId, quoteId);

  if (!quote) {
    throw new Error("Preventivo non trovato");
  }

  const updatedServizi = [...(quote.servizi || []), service];
  const newTotal = calculateTotal(updatedServizi);

  await updateQuote(userId, quoteId, {
    servizi: updatedServizi,
    totale: newTotal,
  });
}

/**
 * Rimuove un servizio da un preventivo
 */
export async function removeServiceFromQuote(
  userId: string,
  quoteId: string,
  serviceId: string
): Promise<void> {
  const db = getFirestoreInstance();
  const quote = await getQuote(userId, quoteId);

  if (!quote) {
    throw new Error("Preventivo non trovato");
  }

  const updatedServizi = (quote.servizi || []).filter((s) => s.id !== serviceId);
  const newTotal = calculateTotal(updatedServizi);

  await updateQuote(userId, quoteId, {
    servizi: updatedServizi,
    totale: newTotal,
  });
}

/**
 * Genera un ID univoco per i documenti
 */
function generateDocumentId(): string {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

/**
 * Esporta un preventivo in formato PDF (stub - implementare con libreria PDF)
 */
export async function exportQuoteToPDF(
  userId: string,
  quoteId: string
): Promise<Blob> {
  const quote = await getQuote(userId, quoteId);
  if (!quote) {
    throw new Error("Preventivo non trovato");
  }

  // TODO: Implementare la generazione del PDF usando una libreria come pdfkit o html2pdf
  throw new Error("Funzionalità non ancora implementata");
}
