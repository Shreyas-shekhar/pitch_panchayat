import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    where,
    runTransaction,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC_Iy75qmDUsNvAKYAl-3EeQbsS3KhAjS8",
    authDomain: "pitch-panchayat.firebaseapp.com",
    projectId: "pitch-panchayat",
    storageBucket: "pitch-panchayat.firebasestorage.app",
    messagingSenderId: "253308693302",
    appId: "1:253308693302:web:c92d606b431288d1996197",
    measurementId: "G-K8HFCBLLQ0"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export {
    db,
    auth,
    googleProvider,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    query,
    where,
    runTransaction,
    getDoc,
    serverTimestamp
};



