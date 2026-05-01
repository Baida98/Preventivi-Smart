import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  Timestamp,
  type Transaction,
} from "firebase/firestore";
import { getFirestoreInstance } from "./firebase-service";

/**
 * Struttura del contatore per la numerazione dei preventivi
 */
export type QuoteCounter = {
  year: number; // Anno corrente del contatore
  sequence: number; // Numero sequenziale per l'anno
  updatedAt: string; // Timestamp ultimo aggiornamento
};

/**
 * Ottiene il contatore corrente per l'utente
 * Se non esiste, lo crea con valore iniziale
 */
export async function getQuoteCounter(userId: string): Promise<QuoteCounter> {
  const db = getFirestoreInstance();
  if (!db) throw new Error("Firebase non configurato.");
  const userRef = doc(db, "users", userId);
  const counterRef = doc(userRef, "counters", "quotes");

  const snap = await getDoc(counterRef);

  if (snap.exists()) {
    return snap.data() as QuoteCounter;
  }

  // Crea il contatore se non esiste
  const currentYear = new Date().getFullYear();
  const newCounter: QuoteCounter = {
    year: currentYear,
    sequence: 0,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(counterRef, newCounter);
  return newCounter;
}

/**
 * Genera il prossimo numero di preventivo
 * Usa una transazione per garantire l'unicità
 *
 * Formato: YYYY-NNNN (es: 2026-0001)
 * - YYYY: anno corrente
 * - NNNN: numero sequenziale (4 cifre, zero-padded)
 */
export async function generateNextQuoteNumber(userId: string): Promise<string> {
  const db = getFirestoreInstance();
  if (!db) throw new Error("Firebase non configurato.");

  return runTransaction(db, async (transaction: Transaction) => {
    const userRef = doc(db, "users", userId);
    const counterRef = doc(userRef, "counters", "quotes");

    // Leggi il contatore
    const counterSnap = await transaction.get(counterRef);
    const currentYear = new Date().getFullYear();
    let currentSequence = 0;

    if (counterSnap.exists()) {
      const data = counterSnap.data() as QuoteCounter;
      // Se il contatore è dello stesso anno, usa il valore corrente
      if (data.year === currentYear) {
        currentSequence = data.sequence;
      }
      // Altrimenti reset a 0 (nuovo anno)
    }

    // Incrementa il numero sequenziale
    const nextSequence = currentSequence + 1;

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

    // Genera il numero nel formato YYYY-NNNN
    return formatQuoteNumber(currentYear, nextSequence);
  });
}

/**
 * Formatta il numero di preventivo nel formato YYYY-NNNN
 */
export function formatQuoteNumber(year: number, sequence: number): string {
  return `${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Estrae l'anno dal numero di preventivo
 */
export function extractYearFromNumber(numero: string): number {
  const parts = numero.split("-");
  if (parts.length !== 2) {
    throw new Error(`Formato numero preventivo non valido: ${numero}`);
  }
  return parseInt(parts[0], 10);
}

/**
 * Estrae il numero sequenziale dal numero di preventivo
 */
export function extractSequenceFromNumber(numero: string): number {
  const parts = numero.split("-");
  if (parts.length !== 2) {
    throw new Error(`Formato numero preventivo non valido: ${numero}`);
  }
  return parseInt(parts[1], 10);
}

/**
 * Valida il formato del numero di preventivo
 */
export function isValidQuoteNumber(numero: string): boolean {
  const regex = /^\d{4}-\d{4}$/;
  if (!regex.test(numero)) {
    return false;
  }

  try {
    const year = extractYearFromNumber(numero);
    const sequence = extractSequenceFromNumber(numero);

    // Valida che l'anno sia ragionevole (tra 2020 e 2100)
    if (year < 2020 || year > 2100) {
      return false;
    }

    // Valida che il numero sequenziale sia positivo
    if (sequence <= 0 || sequence > 9999) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Resetta il contatore per l'anno corrente
 * ATTENZIONE: Usa con cautela, potrebbe causare duplicati
 */
export async function resetQuoteCounter(userId: string): Promise<void> {
  const db = getFirestoreInstance();
  if (!db) throw new Error("Firebase non configurato.");
  const userRef = doc(db, "users", userId);
  const counterRef = doc(userRef, "counters", "quotes");

  const currentYear = new Date().getFullYear();
  const newCounter: QuoteCounter = {
    year: currentYear,
    sequence: 0,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(counterRef, newCounter);
}

/**
 * Ottiene il numero di preventivi creati nell'anno corrente
 */
export async function getQuotesCountForCurrentYear(userId: string): Promise<number> {
  const counter = await getQuoteCounter(userId);
  const currentYear = new Date().getFullYear();

  if (counter.year === currentYear) {
    return counter.sequence;
  }

  return 0;
}

/**
 * Ottiene il numero di preventivi creati in un anno specifico
 */
export async function getQuotesCountForYear(
  userId: string,
  year: number
): Promise<number> {
  const counter = await getQuoteCounter(userId);

  if (counter.year === year) {
    return counter.sequence;
  }

  // Se l'anno è diverso, il contatore è stato resettato
  return 0;
}

/**
 * Genera un numero di preventivo personalizzato
 * Utile per importare preventivi da altri sistemi
 */
export async function generateCustomQuoteNumber(
  userId: string,
  year: number,
  sequence: number
): Promise<string> {
  if (sequence <= 0 || sequence > 9999) {
    throw new Error("Il numero sequenziale deve essere tra 1 e 9999");
  }

  if (year < 2020 || year > 2100) {
    throw new Error("L'anno deve essere tra 2020 e 2100");
  }

  return formatQuoteNumber(year, sequence);
}
