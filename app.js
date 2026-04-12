import { auth, provider, db } from "./firebase.js";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let user = null;

/* LOGIN GOOGLE */
window.login = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    alert("Errore login");
  }
};

/* LOGOUT */
window.logout = async () => {
  await signOut(auth);
};

/* STATO UTENTE */
onAuthStateChanged(auth, async (u) => {
  user = u;

  if (user) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("userEmail").innerText = user.email;

    await loadPreventivi();
  } else {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

/* CREA PREVENTIVO */
window.creaPreventivo = async () => {
  const cliente = document.getElementById("cliente").value;
  const servizio = document.getElementById("servizio").value;
  const prezzo = Number(document.getElementById("prezzo").value);

  if (!cliente || !servizio || !prezzo) return;

  await addDoc(collection(db, "preventivi"), {
    uid: user.uid,
    cliente,
    servizio,
    prezzo,
    createdAt: Date.now()
  });

  await loadPreventivi();
};

/* CARICA PREVENTIVI */
async function loadPreventivi() {
  const q = query(
    collection(db, "preventivi"),
    where("uid", "==", user.uid)
  );

  const snap = await getDocs(q);

  let html = "";

  snap.forEach((doc) => {
    const d = doc.data();

    html += `
      <div class="card">
        <b>${d.cliente}</b><br>
        ${d.servizio}<br>
        ${d.prezzo} €
      </div>
    `;
  });

  document.getElementById("lista").innerHTML = html;
}
