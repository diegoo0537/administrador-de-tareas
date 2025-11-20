import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBGWNyj1Gxfe6RwxdBIVE2SKD72wQMBCW4",
    authDomain: "administrador-de-tareas-b4c1f.firebaseapp.com",
    projectId: "administrador-de-tareas-b4c1f",
    storageBucket: "administrador-de-tareas-b4c1f.firebasestorage.app",
    messagingSenderId: "252266911176",
    appId: "1:252266911176:web:a0edb7175e85ab82c59cfd",
    measurementId: "G-1EJXZFQVGV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar todo lo que necesites
export { db, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc };