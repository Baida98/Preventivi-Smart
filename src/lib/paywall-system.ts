/**
 * COMMIT 10: Paywall Lite - Prima monetizzazione
 * 
 * Sistema crediti semplice:
 * - Primo report gratis (mostra valore)
 * - Blocca range + consiglio per utenti senza crediti
 * - Crediti: 5 per €5 (1 credito = 1 report completo)
 */

import { getFirestoreInstance } from "./firebase-service";
import { collection, doc, getDoc, updateDoc, addDoc, query, where, getDocs } from "firebase/firestore";

export interface UserCredits {
  userId: string;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  tier: "free" | "basic" | "pro";
  createdAt: number;
  updatedAt: number;
}

export interface CreditTransaction {
  id?: string;
  userId: string;
  type: "grant" | "purchase" | "use" | "refund";
  amount: number;
  reason: string;
  timestamp: number;
  reportId?: string;
}

/**
 * COMMIT 10: Ottiene i crediti dell'utente
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return {
        userId,
        totalCredits: 1, // Primo report gratis
        usedCredits: 0,
        availableCredits: 1,
        tier: "free",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const docRef = doc(db, "user_credits", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserCredits;
      return {
        ...data,
        availableCredits: data.totalCredits - data.usedCredits,
      };
    }

    // Nuovo utente: 1 credito gratis
    const newUser: UserCredits = {
      userId,
      totalCredits: 1,
      usedCredits: 0,
      availableCredits: 1,
      tier: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await updateDoc(docRef, newUser as any);
    } catch {
      // Se il doc non esiste, lo crea
      await addDoc(collection(db, "user_credits"), newUser);
    }

    return newUser;
  } catch (err) {
    console.error("Errore nel recupero crediti:", err);
    return {
      userId,
      totalCredits: 1,
      usedCredits: 0,
      availableCredits: 1,
      tier: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}

/**
 * COMMIT 10: Usa un credito per un report
 */
export async function useCredit(userId: string, reportId: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    if (!db) return false;

    const credits = await getUserCredits(userId);

    if (credits.availableCredits <= 0) {
      console.warn(`Utente ${userId} non ha crediti disponibili`);
      return false;
    }

    // Aggiorna i crediti
    const docRef = doc(db, "user_credits", userId);
    await updateDoc(docRef, {
      usedCredits: credits.usedCredits + 1,
      updatedAt: Date.now(),
    });

    // Registra la transazione
    await addDoc(collection(db, "credit_transactions"), {
      userId,
      type: "use",
      amount: -1,
      reason: "Report completo utilizzato",
      timestamp: Date.now(),
      reportId,
    } as CreditTransaction);

    console.log(`Credito utilizzato per ${userId}: report ${reportId}`);
    return true;
  } catch (err) {
    console.error("Errore nell'utilizzo del credito:", err);
    return false;
  }
}

/**
 * COMMIT 10: Concedi crediti (admin)
 */
export async function grantCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    if (!db) return false;

    const credits = await getUserCredits(userId);

    const docRef = doc(db, "user_credits", userId);
    await updateDoc(docRef, {
      totalCredits: credits.totalCredits + amount,
      updatedAt: Date.now(),
    });

    // Registra la transazione
    await addDoc(collection(db, "credit_transactions"), {
      userId,
      type: "grant",
      amount,
      reason,
      timestamp: Date.now(),
    } as CreditTransaction);

    console.log(`${amount} crediti concessi a ${userId}: ${reason}`);
    return true;
  } catch (err) {
    console.error("Errore nel concedere crediti:", err);
    return false;
  }
}

/**
 * COMMIT 10: Acquista crediti
 */
export async function purchaseCredits(
  userId: string,
  amount: number,
  paymentId: string
): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    if (!db) return false;

    const credits = await getUserCredits(userId);

    // Calcola il prezzo: 5 crediti per €5 (1 credito = €1)
    const price = amount; // €1 per credito

    const docRef = doc(db, "user_credits", userId);
    await updateDoc(docRef, {
      totalCredits: credits.totalCredits + amount,
      updatedAt: Date.now(),
    });

    // Registra la transazione
    await addDoc(collection(db, "credit_transactions"), {
      userId,
      type: "purchase",
      amount,
      reason: `Acquisto ${amount} crediti a €${price}/credito`,
      timestamp: Date.now(),
    } as CreditTransaction);

    console.log(`${amount} crediti acquistati da ${userId}`);
    return true;
  } catch (err) {
    console.error("Errore nell'acquisto di crediti:", err);
    return false;
  }
}

/**
 * COMMIT 10: Verifica se l'utente può accedere al report completo
 */
export async function canAccessFullReport(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return credits.availableCredits > 0;
}

/**
 * COMMIT 10: Genera il paywall message
 */
export function generatePaywallMessage(
  availableCredits: number,
  tier: string
): { locked: boolean; message: string; action: string } {
  if (availableCredits > 0) {
    return {
      locked: false,
      message: `Hai ${availableCredits} credito${availableCredits > 1 ? "i" : ""} disponibile${availableCredits > 1 ? "i" : ""}`,
      action: "Visualizza Report Completo",
    };
  }

  if (tier === "free") {
    return {
      locked: true,
      message: "Hai utilizzato il tuo report gratis. Acquista crediti per continuare.",
      action: "Acquista 5 Crediti (€5)",
    };
  }

  return {
    locked: true,
    message: "Crediti esauriti. Ricarica il tuo account.",
    action: "Acquista Crediti",
  };
}

/**
 * COMMIT 10: Recupera la storia delle transazioni
 */
export async function getTransactionHistory(userId: string): Promise<CreditTransaction[]> {
  try {
    const db = getFirestoreInstance();
    if (!db) return [];

    const q = query(
      collection(db, "credit_transactions"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as CreditTransaction));
  } catch (err) {
    console.error("Errore nel recupero della storia transazioni:", err);
    return [];
  }
}
