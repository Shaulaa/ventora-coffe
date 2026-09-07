"use client";

import Navbar from "@/components/Navbar";
import ReservationForm from "@/components/ReservationForm";
import MyReservations from "@/components/MyReservations";
import { Coffee, Calendar, Clock, Users, CheckCircle, Phone, Armchair, Sofa, UserPlus } from "lucide-react";

export default function ReservasiPage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-espresso">
      <Navbar />

      {/* hero Section */}
      <section className="relative overflow-hidden bg-surface pb-16 dark:bg-espresso">
        <div className="relative mx-auto max-w-screen-xl px-6 pt-12">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-light dark:bg-espresso-light">
              <Coffee className="h-8 w-8 text-rust" />
            </div>
            <p className="font-data text-xs uppercase tracking-[0.3em] text-rust">
              Reservasi Meja
            </p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">
              Dapatkan Meja Favoritmu
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-foreground/70">
              Pesan meja sebelum datang dan nikmati kopi tanpa khawatir kehabisan tempat. Gratis, mudah, dan cepat!
            </p>
          </div>

          {/* Info Cards - Horizontal on Desktop */}
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl bg-surface-light p-4 dark:bg-espresso-light">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber/20">
                <Calendar className="h-5 w-5 text-amber" />
              </div>
              <div>
                <p className="font-medium">Buka Setiap Hari</p>
                <p className="text-xs text-foreground/60">Senin - Minggu</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-surface-light p-4 dark:bg-espresso-light">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rust/20">
                <Clock className="h-5 w-5 text-rust" />
              </div>
              <div>
                <p className="font-medium">09:00 - 22:00 WIB</p>
                <p className="text-xs text-foreground/60">Jam Operasional</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-surface-light p-4 dark:bg-espresso-light">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/20">
                <Users className="h-5 w-5 text-sage" />
              </div>
              <div>
                <p className="font-medium">2 - 20 Orang</p>
                <p className="text-xs text-foreground/60">Kapasitas Meja</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-surface-light p-4 dark:bg-espresso-light">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rust/20">
                <Phone className="h-5 w-5 text-rust" />
              </div>
              <div>
                <p className="font-medium">Konfirmasi WA</p>
                <p className="text-xs text-foreground/60">Dalam 30 menit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-screen-xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Reservation Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-xl dark:bg-espresso-light">
                {/* Form Header */}
                <div className="bg-rust p-6 text-paper">
                  <h2 className="font-display text-xl">Form Reservasi</h2>
                  <p className="mt-1 text-sm text-paper/80">
                    Isi data di bawah untuk booking meja
                  </p>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <ReservationForm />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual & Info */}
          <div className="lg:col-span-3 space-y-8">
            {/* Table Selection Visual */}
            <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-xl dark:bg-espresso-light">
              <div className="bg-rust p-6 text-paper">
                <h3 className="font-display text-xl">Pilih Meja Sesuai Kebutuhan</h3>
                <p className="mt-1 text-sm text-paper/70">Kami punya berbagai pilihan meja untukmu</p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                {/* Table Type 1 */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-amber/30 bg-surface-light p-5 transition-all hover:border-amber hover:shadow-lg dark:bg-espresso dark:border-amber/50 dark:hover:border-amber">
                  <div className="relative">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-amber/20">
                      <Armchair className="h-6 w-6 text-amber" />
                    </div>
                    <h4 className="font-display text-lg">Meja Intim</h4>
                    <p className="mt-1 text-sm text-foreground/60">2-4 orang</p>
                    <p className="mt-2 text-xs text-foreground/50">
                      Cocok untuk kencan, ngobrol santai, atau working session
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-amber/20 px-2 py-1 text-xs text-amber">Best Seller</span>
                    </div>
                  </div>
                </div>

                {/* Table Type 2 */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-rust/30 bg-surface-light p-5 transition-all hover:border-rust hover:shadow-lg dark:bg-espresso dark:border-rust/50 dark:hover:border-rust">
                  <div className="relative">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-rust/20">
                      <Sofa className="h-6 w-6 text-rust" />
                    </div>
                    <h4 className="font-display text-lg">Meja Keluarga</h4>
                    <p className="mt-1 text-sm text-foreground/60">6-8 orang</p>
                    <p className="mt-2 text-xs text-foreground/50">
                      Ideal untuk makan bareng keluarga atau reunion
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-rust/20 px-2 py-1 text-xs text-rust">Ruang Privat</span>
                    </div>
                  </div>
                </div>

                {/* Table Type 3 */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-sage/30 bg-surface-light p-5 transition-all hover:border-sage hover:shadow-lg dark:bg-espresso dark:border-sage/50 dark:hover:border-sage sm:col-span-2">
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sage/20">
                      <UserPlus className="h-6 w-6 text-sage" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display text-lg">Grup Besar (10+)</h4>
                      <p className="mt-1 text-sm text-foreground/60">10-20 orang</p>
                      <p className="mt-2 text-xs text-foreground/50">
                        Reservation besar? Hubungi kami langsung untuk arrange tempat terbaik
                      </p>
                    </div>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-sage/90"
                    >
                      Hubungi
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Reserve */}
            <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-xl dark:bg-espresso-light">
              <div className="p-6">
                <h3 className="font-display text-xl">Kenapa Reservasi di Ventora?</h3>
              </div>
              <div className="grid gap-4 p-6 pt-0 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage/20">
                    <CheckCircle className="h-4 w-4 text-sage" />
                  </div>
                  <div>
                    <p className="font-medium">Tanpa Deposit</p>
                    <p className="text-xs text-foreground/60">Booking gratis, bayar di tempat</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage/20">
                    <CheckCircle className="h-4 w-4 text-sage" />
                  </div>
                  <div>
                    <p className="font-medium">Bebas Cancel</p>
                    <p className="text-xs text-foreground/60">Batalkan H-1 sebelum datang</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage/20">
                    <CheckCircle className="h-4 w-4 text-sage" />
                  </div>
                  <div>
                    <p className="font-medium">Konfirmasi Cepat</p>
                    <p className="text-xs text-foreground/60">Via WhatsApp dalam 30 menit</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage/20">
                    <CheckCircle className="h-4 w-4 text-sage" />
                  </div>
                  <div>
                    <p className="font-medium">Priority Seating</p>
                    <p className="text-xs text-foreground/60">Meja siap saat kamu datang</p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Reservations */}
            <MyReservations />
          </div>
        </div>
      </section>
    </div>
  );
}
