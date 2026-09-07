"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isAdmin = redirect.includes("/admin");

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20">
        <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
          {isAdmin ? "Admin Access" : "Selamat datang kembali"}
        </p>
        <h1 className="mt-1 font-display text-4xl">
          {isAdmin ? "Masuk sebagai Admin" : "Masuk ke akunmu"}
        </h1>
        <div className="mt-8">
          <AuthForm mode="login" redirectUrl={decodeURIComponent(redirect)} isAdmin={isAdmin} />
        </div>
        {!isAdmin && (
          <p className="mt-6 text-sm text-foreground/70">
            Belum punya akun?{" "}
            <Link href="/register" className="text-amber hover:underline">
              Daftar dulu
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <LoginContent />
    </Suspense>
  );
}
