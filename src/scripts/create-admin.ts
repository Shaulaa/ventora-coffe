// Script untuk membuat admin account
// Jalankan dengan: npx tsx src/scripts/create-admin.ts <email> <password>

import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Baca .env.local secara manual
function getEnv(key: string): string {
  try {
    const envFile = readFileSync(".env.local", "utf-8");
    const lines = envFile.split("\n");
    for (const line of lines) {
      if (line.startsWith(`${key}=`)) {
        return line.split("=")[1].trim();
      }
    }
  } catch (e) {
    console.error("Error reading .env.local:", e);
  }
  return "";
}

// Initialize Firebase dengan env dari .env.local
const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin(email: string, password: string) {
  console.log("🚀 Creating admin account...\n");
  console.log("📧 Email:", email);
  console.log("🔑 Password:", password);
  console.log("");

  if (!firebaseConfig.projectId || firebaseConfig.projectId === "demo-project") {
    console.error("❌ ERROR: Firebase config not loaded properly!");
    console.error("   Please check your .env.local file");
    process.exit(1);
  }

  try {
    // 1. Create user di Firebase Auth
    console.log("1️⃣ Creating user in Firebase Auth...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("   ✓ User created:", user.uid);

    // 2. Create user document di Firestore dengan role admin
    console.log("2️⃣ Creating user document in Firestore...");
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      email: email,
      displayName: "Admin",
      role: "admin", // Ini yang bikin jadi admin
      createdAt: serverTimestamp(),
    });
    console.log("   ✓ User document created with role: admin");

    console.log("\n✅ Admin account created successfully!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("   1. Login di app dengan email dan password di atas");
    console.log("   2. Akses /admin untuk melihat dashboard admin");
    console.log("");
    console.log("⚠️  Penting:");
    console.log("   - Simpan kredensial ini di tempat yang aman!");
    console.log("   - Jangan share credentials ini ke orang yang tidak dipercaya");

  } catch (error) {
    console.error("\n❌ Failed to create admin:", (error as Error).message);
    console.error("");
    console.error("📋 Common issues:");
    console.error("   1. Email sudah terdaftar → gunakan email lain atau login");
    console.error("   2. Password terlalu lemah → minimal 6 karakter");
    console.error("   3. Firebase Auth belum enable Email/Password → aktifkan di Firebase Console");
    process.exit(1);
  }
}

// Ambil email dan password dari command line arguments
const email = process.argv[2] || "admin@ventora.coffe";
const password = process.argv[3] || "admin123";

createAdmin(email, password);
