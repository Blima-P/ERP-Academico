import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5vXZnfLWxNOQ_qiRTK26_KhsCgj1WCO4",
  authDomain: "erp-academico-50a57.firebaseapp.com",
  projectId: "erp-academico-50a57",
  storageBucket: "erp-academico-50a57.firebasestorage.app",
  messagingSenderId: "410458998600",
  appId: "1:410458998600:web:e078e5be7e85c3991bd57d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);