import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import { wizard } from "./engine/wizard.js";
import { calculate } from "./engine/core.js";
import { buildStats } from "./engine/analytics.js";

let user = null;
let i = 0;
let data = {};
let stats = {};

window.login = async () => {
  const { signInWithPopup, GoogleAuthProvider } =
    await import("https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js");

  await signInWithPopup(auth, new GoogleAuthProvider());
};

window.logout = () => auth.signOut();

auth.onAuthStateChanged(async u => {
  user = u;
  document.getElementById("user").innerText = u ? u.email : "non loggato";

  if(u){
    const snap = await getDocs(collection(db,"preventivi"));
    const arr = snap.docs.map(d=>d.data());
    stats = await buildStats(arr);
    render();
  }
});

function render(){

  const step = wizard[i];

  document.getElementById("wizard").innerHTML = `
    <p>${step.label}</p>
    ${
      step.type==="select"
      ? `<select id="inp">${step.options.map(o=>`<option>${o}</option>`).join("")}</select>`
      : step.type==="number"
      ? `<input id="inp" type="number">`
      : `<select id="inp"><option>no</option><option>si</option></select>`
    }
  `;
}

render();

document.getElementById("next").onclick = async () => {

  const step = wizard[i];
  const val = document.getElementById("inp").value;

  data[step.key] = step.type==="number" ? Number(val) : val;

  i++;

  if(i < wizard.length){
    render();
    return;
  }

  const res = calculate(data, stats);

  document.getElementById("result").innerText =
    `€ ${res.min.toFixed(0)} - ${res.mid.toFixed(0)} - ${res.max.toFixed(0)}`;

  await addDoc(collection(db,"preventivi"),{
    ...data,
    prezzo: res.mid,
    uid: user?.uid || null,
    createdAt: serverTimestamp()
  });
};
