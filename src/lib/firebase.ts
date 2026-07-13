import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Semua key diambil dari environment variable, jangan pernah hardcode
// key asli langsung di file ini. Isi nilainya di .env.local (lihat .env.local.example).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isConfigured && typeof window !== "undefined") {
  console.warn(
    "Firebase belum dikonfigurasi. Salin .env.local.example ke .env.local dan isi credential dari Firebase Console."
  );
}

// Pakai config dummy pas Firebase belum diisi, biar build/prerender gak crash.
// Fitur auth & firestore tetap gak akan berfungsi sampai .env.local beneran diisi.
const app = getApps().length
  ? getApp()
  : initializeApp(
      isConfigured
        ? firebaseConfig
        : { apiKey: "demo-key", authDomain: "demo.firebaseapp.com", projectId: "demo-project" }
    );

export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseIsConfigured = isConfigured;
export default app;
