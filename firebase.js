import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs,
  updateDoc, query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABpnRRv30zYTN0J_IReUgZPY88FSm9Omw",
  authDomain: "kurirtabin.firebaseapp.com",
  projectId: "kurirtabin",
  storageBucket: "kurirtabin.firebasestorage.app",
  messagingSenderId: "55763945350",
  appId: "1:55763945350:web:a06e1e51fea385aa494e07"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app, auth, db, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, collection, addDoc, doc, setDoc,
  getDoc, getDocs, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp
};
