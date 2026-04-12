import { auth } from "./firebase.js";
import { calcolaBase } from "./engine/core.js";
import { aiPredict, aiTrain } from "./engine/ai.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

let lastQuote = null;

/* ---------------- LOGIN ---------------- */

document.getElementById("google").onclick = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Login error: " + e.code);
  }
};

document.getElementById("logout").onclick = () => signOut(auth);

/* ---------------- CALCOLO ---------------- */

document.getElementById("calcola").onclick = async () => {

  const data = {
    tipo: document.getElementById("tipo").value,
    mq: Number(document.getElementById("mq").value),
    qualita: document.getElementById("qualita").value,
    citta: document.getElementById("citta").value
  };

  const base = calcolaBase(data);

  let ai = { price: null, confidence: 0 };

  try {
    ai = await aiPredict(data.tipo, data.citta);
  } catch {}

  let final = base.mid;

  if (ai.price && ai.confidence > 40) {
    final = (base.mid + ai.price) / 2;
  }

  final = isNaN(final) ? base.mid : final;

  lastQuote = {
    ...data,
    min: base.min,
    mid: final,
    max: base.max,
    aiConfidence: ai.confidence
  };

  document.getElementById("output").innerText =
    `€ ${final.toFixed(0)} (AI ${ai.confidence}%)`;
};

/* ---------------- SAVE + TRAIN AI ---------------- */

document.getElementById("save").onclick = async () => {

  const user = auth.currentUser;

  if (!user) {
    alert("Login richiesto");
    return;
  }

  if (!lastQuote) {
    alert("Nessun preventivo calcolato");
    return;
  }

  try {
    await addDoc(collection(db, "quotes"), {
      ...lastQuote,
      uid: user.uid,
      createdAt: Date.now()
    });

    await aiTrain(
      lastQuote.tipo,
      lastQuote.citta,
      lastQuote.mid
    );

    alert("Salvato + AI aggiornata");

  } catch (e) {
    alert("Errore salvataggio");
  }
};

/* ---------------- AUTH STATE ---------------- */

onAuthStateChanged(auth, (user) => {

  const authDiv = document.getElementById("authDiv");
  const appDiv = document.getElementById("appDiv");

  if (!authDiv || !appDiv) return;

  if (user) {
    authDiv.style.display = "none";
    appDiv.style.display = "block";
  } else {
    authDiv.style.display = "block";
    appDiv.style.display = "none";
  }
});
