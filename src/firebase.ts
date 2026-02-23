// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// مفاتيح الربط الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyANv4kf7cjoLdTGGZqkI3DX0TVMyi6j2_A",
  authDomain: "life-os-6c01f.firebaseapp.com",
  projectId: "life-os-6c01f",
  storageBucket: "life-os-6c01f.firebasestorage.app",
  messagingSenderId: "870895248318",
  appId: "1:870895248318:web:0de4b80a0cf8663b564fef",
  measurementId: "G-W7RN5B5WZP"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);

// تصدير أدوات تسجيل الدخول وقاعدة البيانات حتى نستخدمها بباقي النظام
export const auth = getAuth(app);
export const db = getFirestore(app);
