// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';  // Add this import

const firebaseConfig = {
    apiKey: "AIzaSyB5ZrpPnHXDGK60oh2E_3LyVMeS6scUDCc",
    authDomain: "dco-dare.firebaseapp.com",
    projectId: "dco-dare",
    storageBucket: "dco-dare.firebasestorage.app",
    messagingSenderId: "521137193796",
    appId: "1:521137193796:web:f976681248d6fdc1088d11",
    measurementId: "G-ZK9H9FJ2WZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);  // Add this line

// Change exports to match what storage.ts expects
export const firestore = db;  // Add this alias