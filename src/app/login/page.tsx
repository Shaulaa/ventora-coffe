"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { Coffee } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isAdmin = redirect.includes("/admin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <Link href="/" className="mb-8 flex flex-col items-center gap-2">
        <Coffee className="h-12 w-12 text-rust" />
        <span className="font-display text-2xl tracking-tight">Ventora Coffee</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl">
            {isAdmin ? "Admin Login" : "Selamat datang"}
          </h1>
          <p className="mt-2 text-foreground/60">
            {isAdmin ? "Masuk untuk mengelola pesanan" : "Masuk ke akunmu"}
          </p>
        </div>

        <AuthForm
          mode="login"
          redirectUrl={encodeURIComponent(redirect)}
          isAdmin={isAdmin}
        />

        {!isAdmin && (
          <p className="mt-6 text-center text-sm text-foreground/70">
            Belum punya akun?{" "}
            <Link href="/register" className="text-rust hover:underline">
              Daftar dulu
            </Link>
          </p>
        )}

        {isAdmin && (
          <p className="mt-6 text-center text-sm text-foreground/60">
            <Link href="/login" className="text-rust hover:underline">
              Login sebagai customer
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <Link href="/" className="mb-8 flex flex-col items-center gap-2">
        <Coffee className="h-12 w-12 text-rust" />
        <span className="font-display text-2xl tracking-tight">Ventora Coffee</span>
      </Link>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-rust/30 border-t-rust" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
