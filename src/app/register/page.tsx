import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20">
        <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
          Gabung dulu, yuk
        </p>
        <h1 className="mt-1 font-display text-4xl">Buat akun baru</h1>
        <div className="mt-8">
          <AuthForm mode="register" />
        </div>
        <p className="mt-6 text-sm text-foreground/70">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-amber hover:underline">
            Masuk di sini
          </Link>
        </p>
      </section>
    </div>
  );
}
