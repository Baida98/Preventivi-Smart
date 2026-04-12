import { db } from "../firebase.js";
import { doc, getDoc, setDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

export async function aiPredict(tipo, citta) {

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
}

export async function aiTrain(tipo, citta, prezzo) {

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

  await updateDoc(ref, {
    count: d.count + 1,
    total: d.total + prezzo,
    avg: (d.total + prezzo) / (d.count + 1)
  });
}
