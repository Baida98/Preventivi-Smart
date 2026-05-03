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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} | null {
  if (!isFirebaseConfigured) return null;

  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { app: app!, auth: auth!, db: db! };
}

export function getFirestoreInstance(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  if (!db) initializeFirebase();
  return db;
}

export function getAuthInstance(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (!auth) initializeFirebase();
  return auth;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const authInstance = getAuthInstance();
  if (!authInstance) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
}

export async function signInWithGoogle(): Promise<User | null> {
  const authInstance = getAuthInstance();
  if (!authInstance) {
    console.warn("Firebase non configurato. Aggiungi le variabili VITE_FIREBASE_* al file .env");
    return null;
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(authInstance, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const authInstance = getAuthInstance();
  if (!authInstance) return;
  await signOut(authInstance);
}

export function getCurrentUser(): User | null {
  const authInstance = getAuthInstance();
  if (!authInstance) return null;
  return authInstance.currentUser;
}

export async function createQuote(
  userId: string,
  quoteData: Omit<Quote, "id" | "numero" | "createdAt" | "updatedAt" | "uid">
): Promise<CreateQuoteResponse> {
  const dbInstance = getFirestoreInstance();
  if (!dbInstance) throw new Error("Firebase non configurato.");

  return runTransaction(dbInstance, async (transaction: Transaction) => {
    const userRef = doc(dbInstance, "users", userId);
    const counterRef = doc(userRef, "counters", "quotes");

    const counterSnap = await transaction.get(counterRef);
    const currentYear = new Date().getFullYear();
    let currentCounter = 0;

    if (counterSnap.exists()) {
      const data = counterSnap.data();
      if (data.year === currentYear) {
        currentCounter = data.sequence;
      }
    }

    const nextSequence = currentCounter + 1;
    const numero = formatQuoteNumber(currentYear, nextSequence);

    transaction.set(
      counterRef,
      {
        year: currentYear,
        sequence: nextSequence,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    const quoteId = generateDocumentId();
    const now = Timestamp.now();
    const nowIso = now.toDate().toISOString();
    const newQuote: Quote = {
      ...quoteData,
      id: quoteId,
      uid: userId,
      numero,
      createdAt: nowIso,
      updatedAt: nowIso,
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

export async function getQuote(userId: string, quoteId: string): Promise<Quote | null> {
  const dbInstance = getFirestoreInstance();
  if (!dbInstance) return null;

  const userRef = doc(dbInstance, "users", userId);
  const quoteRef = doc(userRef, "quotes", quoteId);

  const snap = await getDoc(quoteRef);
  return snap.exists() ? (snap.data() as Quote) : null;
}

export async function getUserQuotes(userId: string): Promise<Quote[]> {
  const dbInstance = getFirestoreInstance();
  if (!dbInstance) return [];

  const userRef = doc(dbInstance, "users", userId);
  const quotesRef = collection(userRef, "quotes");

  const q = query(quotesRef, orderBy("data", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => doc.data() as Quote);
}

export async function getRecentQuotes(userId: string, count: number = 10): Promise<Quote[]> {
  const dbInstance = getFirestoreInstance();
  if (!dbInstance) return [];

  const userRef = doc(dbInstance, "users", userId);
  const quotesRef = collection(userRef, "quotes");

  const q = query(
    quotesRef,
    orderBy("data", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);

  return snap.docs.map((doc) => doc.data() as Quote);
}

export async function updateQuote(
  userId: string,
  quoteId: string,
  updates: Partial<Quote>
): Promise<void> {
  const dbInstance = getFirestoreInstance();
  if (!dbInstance) throw new Error("Firebase non configurato.");

  const userRef = doc(dbInstance, "users", userId);
  const quoteRef = doc(userRef, "quotes", quoteId);

  const dataToUpdate = { ...updates };
  if (updates.servizi) {
    dataToUpdate.totale = calculateTotal(updates.servizi);
  }

  dataToUpdate.updatedAt = new Date().toISOString();

  await updateDoc(quoteRef, dataToUpdate);
}

export async function deleteQuote(userId: string, quoteId: string): Promise<void> {
  const dbInstance = getFirestoreInstance();
  if (!dbInstance) throw new Error("Firebase non configurato.");

  const userRef = doc(dbInstance, "users", userId);
  const quoteRef = doc(userRef, "quotes", quoteId);

  await deleteDoc(quoteRef);
}

export async function addServiceToQuote(
  userId: string,
  quoteId: string,
  service: Service
): Promise<void> {
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

export async function removeServiceFromQuote(
  userId: string,
  quoteId: string,
  serviceId: string
): Promise<void> {
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

function generateDocumentId(): string {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

export async function exportQuoteToPDF(
  userId: string,
  quoteId: string
): Promise<Blob> {
  const quote = await getQuote(userId, quoteId);
  if (!quote) {
    throw new Error("Preventivo non trovato");
  }

  throw new Error("Funzionalità non ancora implementata");
}
