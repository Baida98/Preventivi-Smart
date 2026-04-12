import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

export async function buildStats() {

  const snap = await getDocs(collection(db,"preventivi"));

  const map = {};

  snap.forEach(d => {
    const x = d.data();

    if(!map[x.tipo]) map[x.tipo] = [];

    map[x.tipo].push(Number(x.prezzo));
  });

  const stats = {};

  for(let k in map){
    const arr = map[k];

    const avg = arr.reduce((a,b)=>a+b,0)/arr.length;

    stats[k] = {
      avg,
      count: arr.length
    };
  }

  return stats;
}
