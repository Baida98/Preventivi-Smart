import { auth, db } from "./firebase.js";
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

let currentQuote = null;

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

/* ---------------- PIPELINE UNICA ---------------- */

document.getElementById("calcola").onclick = async () => {

  const input = {
    tipo: tipo.value,
    mq: Number(mq.value),
    qualita: qualita.value,
    citta: citta.value
  };

  // 1. CORE (base matematica)
  const base = calcolaBase(input);

  // 2. AI (solo suggerimento)
  let ai = { price: null, confidence: 0 };

  try {
    ai = await aiPredict(input.tipo, input.citta);
  } catch {}

  // 3. MERGE UNICO (UN SOLO PUNTO DECISIONE)
  let finalPrice = base.mid;

  if (ai.price && ai.confidence > 40) {
    finalPrice = (base.mid + ai.price) / 2;
  }

  finalPrice = isNaN(finalPrice) ? base.mid : finalPrice;

  // 4. OGGETTO UNICO (VERITÀ UNICA)
  currentQuote = {
    ...input,
    min: base.min,
    mid: finalPrice,
    max: base.max,
    aiConfidence: ai.confidence
  };

  // 5. UI
  output.innerText =
    `€ ${finalPrice.toFixed(0)} (AI ${ai.confidence}%)`;
};

/* ---------------- SAVE + TRAIN ---------------- */

document.getElementById("save").onclick = async () => {

  if (!auth.currentUser) {
    alert("Login richiesto");
    return;
  }

  if (!currentQuote) {
    alert("Calcola prima un preventivo");
    return;
  }

  try {

    // SALVATAGGIO UNICO
    await addDoc(collection(db, "quotes"), {
      ...currentQuote,
      uid: auth.currentUser.uid,
      createdAt: Date.now()
    });

    // AI TRAIN SOLO DOPO SALVATAGGIO
    await aiTrain(
      currentQuote.tipo,
      currentQuote.citta,
      currentQuote.mid
    );

    alert("Salvato + AI aggiornata");

  } catch (e) {
    console.log(e);
    alert("Errore salvataggio");
  }
};

/* ---------------- AUTH ---------------- */

onAuthStateChanged(auth, (user) => {

  if (user) {
    authDiv.style.display = "none";
    appDiv.style.display = "block";
  } else {
    authDiv.style.display = "block";
    appDiv.style.display = "none";
  }
});
