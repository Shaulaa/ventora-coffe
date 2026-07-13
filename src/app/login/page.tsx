import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20">
        <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
          Selamat datang kembali
        </p>
        <h1 className="mt-1 font-display text-4xl">Masuk ke akunmu</h1>
        <div className="mt-8">
          <AuthForm mode="login" />
        </div>
        <p className="mt-6 text-sm text-foreground/70">
          Belum punya akun?{" "}
          <Link href="/register" className="text-amber hover:underline">
            Daftar dulu
          </Link>
        </p>
      </section>
    </div>
  );
}
