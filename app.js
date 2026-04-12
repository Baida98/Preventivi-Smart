import { auth, db } from "./firebase.js";
import { calcolaPreventivo } from "./engine/core.js";
import { predictPrice } from "./engine/ai.js";
import { stats } from "./engine/analytics.js";
import { exportPDF } from "./engine/pdf.js";
import { protect } from "./engine/security.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

let history = [];

protect();

// LOGIN
document.getElementById("google").onclick = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

// CALCOLO
document.getElementById("calcola").onclick = () => {

  const data = {
    tipo: tipo.value,
    mq: Number(mq.value),
    qualita: qualita.value,
    citta: citta.value
  };

  const r = calcolaPreventivo(data);

  document.getElementById("output").innerText =
    `€${r.min.toFixed(0)} - ${r.mid.toFixed(0)} - ${r.max.toFixed(0)}`;

  const ai = predictPrice(history, data.tipo);
  console.log("AI confidence:", ai);
};

// PDF
document.getElementById("pdf").onclick = () => {
  exportPDF({
    tipo: tipo.value,
    mq: mq.value,
    mid: 1000
  });
};

// AUTH
onAuthStateChanged(auth, user => {
  if (user) {
    authDiv.style.display = "none";
    app.style.display = "block";
  }
});
