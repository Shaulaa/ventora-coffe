"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const googleProvider = new GoogleAuthProvider();

type Mode = "login" | "register";

function mapError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/email-already-in-use":
      return "Email sudah terdaftar.";
    case "auth/weak-password":
      return "Password minimal 6 karakter.";
    case "auth/invalid-credential":
      return "Email atau password salah.";
    case "auth/popup-closed-by-user":
      return "Jendela ditutup sebelum selesai.";
    case "auth/popup-blocked":
      return "Popup diblokir browser.";
    default:
      return "Coba lagi sebentar.";
  }
}

export default function AuthForm({
  mode,
  redirectUrl = "/",
  isAdmin = false,
}: {
  mode: Mode;
  redirectUrl?: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if user is logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push(decodeURIComponent(redirectUrl));
    }
  }, [user, authLoading, router, redirectUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Redirect happens via useEffect
    } catch (err) {
      const error = err as { code?: string };
      setError(mapError(error.code || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirect happens via useEffect
    } catch (err) {
      const error = err as { code?: string };
      setError(mapError(error.code || ""));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-foreground/80">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border-soft bg-surface px-4 py-2.5 text-sm outline-none focus:border-rust"
          placeholder="nama@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-foreground/80">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border-soft bg-surface px-4 py-2.5 text-sm outline-none focus:border-rust"
          placeholder="Minimal 6 karakter"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-rust/10 p-3 text-sm text-rust">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || authLoading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-rust py-2.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading || authLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : mode === "login" ? (
          "Masuk"
        ) : (
          "Daftar"
        )}
      </button>

      <div className="flex items-center gap-3 text-xs text-foreground/50">
        <span className="h-px flex-1 bg-border-soft" />
        atau
        <span className="h-px flex-1 bg-border-soft" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || authLoading}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-border-soft bg-surface py-2.5 text-sm transition-colors hover:border-amber disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.73-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l4-3.11Z" />
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
        </svg>
        {isAdmin ? "Masuk dengan Google" : "Lanjutkan dengan Google"}
      </button>
    </form>
  );
}
