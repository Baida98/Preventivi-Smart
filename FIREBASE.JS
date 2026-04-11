const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
