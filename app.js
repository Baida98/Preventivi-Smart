import { loginFirebase, salvaPreventivo, getTuttiPreventivi, auth } from "./firebase.js";
import { calcolaAI } from "./ai.js";

let prezzi = {};

fetch("data.json")
  .then(r => r.json())
  .then(d => prezzi = d);

// LOGIN
window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await loginFirebase(email, password);
  alert("Login effettuato");
};

// CALCOLO
document.getElementById("calcola").onclick = async () => {

  const tipo = document.getElementById("tipo").value;
  const q = parseFloat(document.getElementById("quantita").value);
  const zona = document.getElementById("zona").value;
  const qualita = document.getElementById("qualita").value;

  const base = prezzi[tipo];

  let mol = 1;

  if (zona === "Nord") mol *= 1.15;
  if (zona === "Sud") mol *= 0.9;
  if (qualita === "alta") mol *= 1.3;
  if (qualita === "bassa") mol *= 0.85;

  const stima = base.medio * q * mol;

  let ai = null;

  const dati = await getTuttiPreventivi();
  ai = calcolaAI(dati, tipo, zona);

  let output = `
  💰 Base: €${stima.toFixed(0)}
  `;

  if (ai) {
    output += `<br>🤖 AI: €${ai.medio.toFixed(0)} (Affidabilità ${ai.affidabilita}%)`;
  }

  document.getElementById("risultato").innerHTML = output;

  if (auth.currentUser) {
    await salvaPreventivo({
      uid: auth.currentUser.uid,
      tipo,
      zona,
      stima
    });
  }
};