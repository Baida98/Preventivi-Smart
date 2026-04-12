import { auth, db } from "./firebase.js";
import { calcolaBase } from "./core.js";
import { aiPredict, aiTrain } from "./ai.js";

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
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
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

  // 1. base engine
  const base = calcolaBase(data);

  // 2. AI prediction
  const ai = await aiPredict(data.tipo, data.citta);

  // 3. merge intelligente
  let final = base.mid;

  if (ai.price && ai.confidence > 40) {
    final = (base.mid + ai.price) / 2;
  }

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

/* ---------------- SALVATAGGIO + TRAINING AI ---------------- */

document.getElementById("save").onclick = async () => {

  const user = auth.currentUser;
  if (!user || !lastQuote) return;

  // salva preventivo
  await addDoc(collection(db, "quotes"), {
    ...lastQuote,
    uid: user.uid,
    createdAt: Date.now()
  });

  // 🔥 TRAIN AI (QUI succede “l’apprendimento”)
  await aiTrain(
    lastQuote.tipo,
    lastQuote.citta,
    lastQuote.mid
  );

  alert("Salvato + AI aggiornata");
};

/* ---------------- AUTH STATE ---------------- */

onAuthStateChanged(auth, (user) => {

  const authDiv = document.getElementById("authDiv");
  const appDiv = document.getElementById("appDiv");

  if (user) {
    authDiv.style.display = "none";
    appDiv.style.display = "block";
  } else {
    authDiv.style.display = "block";
    appDiv.style.display = "none";
  }
});
