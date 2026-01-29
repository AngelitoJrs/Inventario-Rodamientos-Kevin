import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGmDUsA8tURwehZbJBLiucQ5o7pYVAisY",
  authDomain: "rodamientoskevin-b29fa.firebaseapp.com",
  databaseURL: "https://rodamientoskevin-b29fa-default-rtdb.firebaseio.com",
  projectId: "rodamientoskevin-b29fa",
  storageBucket: "rodamientoskevin-b29fa.firebasestorage.app",
  messagingSenderId: "329547568048",
  appId: "1:329547568048:web:83bc132c98c186cfc17c75",
  measurementId: "G-JCE0HDFHXD"
};

const app = initializeApp(firebaseConfig);
// Exportamos 'db' para que index.js pueda usarlo
export const db = getFirestore(app);