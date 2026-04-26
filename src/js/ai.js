import { doc, getDoc, setDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import { db } from "./firebase.js";

/* ---------------- PREDICT ---------------- */
export async function aiPredict(tipo, citta) {

  try {
    const id = `${tipo}_${citta}`;
    const ref = doc(db, "ai_stats", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { price: null, confidence: 0 };
    }

    const d = snap.data();

    return {
      price: d.avg,
      confidence: Math.min(100, d.count * 10)
    };

  } catch (e) {
    console.error("AI Predict error:", e);
    return { price: null, confidence: 0 };
  }
}

/* ---------------- TRAIN ---------------- */
export async function aiTrain(tipo, citta, prezzo) {

  try {
    const id = `${tipo}_${citta}`;
    const ref = doc(db, "ai_stats", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        avg: prezzo,
        total: prezzo,
        count: 1
      });
      return;
    }

    const d = snap.data();

    const count = d.count + 1;
    const total = d.total + prezzo;

    await updateDoc(ref, {
      count,
      total,
      avg: total / count
    });

  } catch (e) {
    console.log("AI error", e);
  }
}
