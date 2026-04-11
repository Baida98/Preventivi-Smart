let user = null;

// LOGIN
function login(){

  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, pass)
  .then(u => {
    user = u.user;
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  });
}

// WIZARD
function loadWizard(){

  let w = document.getElementById("work").value;

  document.getElementById("wizard").innerHTML = jobs[w].fields;
}

// CALCOLO AI LEGGERA
function calcola(){

  let w = document.getElementById("work").value;
  let base = jobs[w].base;

  let mq = parseFloat(document.getElementById("mq").value || 1);

  let extra = 1;

  // IMBIANCHITURA
  if(w==="imbianchitura"){
    let s = document.getElementById("stato").value;
    let p = document.getElementById("pittura").value;
    let c = document.getElementById("colori").value;

    if(s==="medio") extra+=0.15;
    if(s==="alto") extra+=0.35;
    if(p==="lavabile") extra+=0.1;
    if(p==="premium") extra+=0.25;
    if(c==="si") extra+=0.2;
  }

  // PIASTRELLE
  if(w==="piastrelle"){
    if(document.getElementById("rimozione").value==="si") extra+=0.4;
    if(document.getElementById("schema").value==="complesso") extra+=0.25;
  }

  // ELETTRICO
  if(w==="elettrico"){
    if(document.getElementById("cert").value==="si") extra+=0.25;
    if(document.getElementById("tracce").value==="si") extra+=0.3;
  }

  // BAGNO
  if(w==="bagno"){
    if(document.getElementById("impianti").value==="si") extra+=0.4;
  }

  // IDRAULICA
  if(w==="idraulica"){
    if(document.getElementById("urgenza").value==="si") extra+=0.3;
  }

  // CARTONGESSO
  if(w==="cartongesso"){
    if(document.getElementById("isolamento").value==="si") extra+=0.25;
  }

  // PULIZIE
  if(w==="pulizie"){
    let s = document.getElementById("sporco").value;
    if(s==="medio") extra+=0.2;
    if(s==="alto") extra+=0.4;
  }

  let valore = base * mq * extra;

  let min = valore * 0.8;
  let med = valore;
  let max = valore * 1.25;

  document.getElementById("result").innerHTML =
    `€ ${min.toFixed(0)} - ${med.toFixed(0)} - ${max.toFixed(0)}`;

  save(w, mq, min, med, max);
}

// SALVATAGGIO AI LEARNING
function save(type, mq, min, med, max){

  if(!user) return;

  db.collection("preventivi").add({
    user: user.uid,
    type,
    mq,
    min,
    med,
    max,
    date: new Date()
  });
}

// STORICO
function loadHistory(){

  if(!user) return;

  db.collection("preventivi")
  .where("user","==",user.uid)
  .get()
  .then(snap=>{

    let html="";

    snap.forEach(d=>{
      let x=d.data();
      html+=`<div>${x.type} → €${x.med.toFixed(0)}</div>`;
    });

    document.getElementById("history").innerHTML=html;
  });
}
