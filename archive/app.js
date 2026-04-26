import { auth, db } from "./firebase.js";
import { calcolaBase } from "./engine/core.js";
import { aiPredict, aiTrain } from "./engine/ai.js";
import { generatePDF } from "./engine/pdf.js";
import { validateInput, formatCurrency } from "./engine/validation.js";
import { quoteHistory } from "./engine/history.js";
import { renderChart } from "./engine/charts.js";

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

/* ---------------- CALCOLO ---------------- */

document.getElementById("calcola").onclick = async () => {

  const input = {
    tipo: document.getElementById("tipo").value,
    mq: Number(document.getElementById("mq").value),
    qualita: document.getElementById("qualita").value,
    citta: document.getElementById("citta").value
  };

  // Validazione input
  const validation = validateInput(input);
  if (!validation.isValid) {
    alert("Errori di validazione:\n" + validation.errors.join("\n"));
    return;
  }

  // 1. CORE (base matematica)
  const base = calcolaBase(input);

  // 2. AI (solo suggerimento)
  let ai = { price: null, confidence: 0 };

  try {
    ai = await aiPredict(input.tipo, input.citta);
  } catch (e) {
    console.warn("AI prediction non disponibile:", e);
  }

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

  // Aggiungi alla history
  quoteHistory.add(currentQuote);

  // 5. UI - Aggiorna il display con formattazione migliorata
  const outputElement = document.getElementById("output");
  outputElement.innerHTML = `
    <div style="background: #1f2937; padding: 15px; border-radius: 8px; margin-top: 10px;">
      <div style="font-size: 14px; color: #9ca3af; margin-bottom: 8px;">Prezzo Stimato</div>
      <div style="font-size: 28px; font-weight: bold; color: #4ade80; margin-bottom: 8px;">${formatCurrency(finalPrice)}</div>
      <div style="font-size: 12px; color: #6b7280;">
        Min: ${formatCurrency(base.min)} | Max: ${formatCurrency(base.max)}
      </div>
      <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
        Affidabilità AI: ${ai.confidence}%
      </div>
    </div>
  `;

  // Renderizza il grafico con la history
  const chartCanvas = document.getElementById("chart");
  if (chartCanvas && quoteHistory.getAll().length > 0) {
    try {
      renderChart(chartCanvas, quoteHistory.getAll());
    } catch (e) {
      console.warn("Errore nel rendering del grafico:", e);
    }
  }
};

/* ---------------- EXPORT PDF ---------------- */

document.getElementById("pdf").onclick = () => {
  if (currentQuote) {
    generatePDF(currentQuote);
  } else {
    alert("Nessun preventivo calcolato");
  }
};

/* ---------------- SAVE + TRAIN AI ---------------- */

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
    console.error("Errore salvataggio:", e);
    alert("Errore salvataggio: " + (e.message || "Errore sconosciuto"));
  }
};

/* ---------------- AUTH ---------------- */

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
