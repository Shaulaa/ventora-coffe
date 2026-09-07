"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, User, Check, Info, ChevronDown, Minus, Plus } from "lucide-react";
import { createReservation, checkAvailability } from "@/lib/firestore-reservations";
import { useAuth } from "@/context/AuthContext";

type ReservationData = {
  date: string;
  time: string;
  guestCount: number;
  name: string;
  phone: string;
  note: string;
};

export default function ReservationForm() {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<ReservationData>({
    date: "",
    time: "",
    guestCount: 2,
    name: "",
    phone: "",
    note: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Validasi ketersediaan saat date/time berubah
  useEffect(() => {
    if (formData.date && formData.time) {
      checkAvailability(formData.date, formData.time).then(setIsAvailable);
    } else {
      setIsAvailable(null);
    }
  }, [formData.date, formData.time]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "guestCount" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setError("Silakan login dulu untuk membuat reservasi");
      return;
    }

    if (!formData.date || !formData.time || !formData.name || !formData.phone) {
      setError("Mohon lengkapi data dengan benar");
      return;
    }

    if (formData.guestCount < 1 || formData.guestCount > 20) {
      setError("Jumlah tamu harus antara 1-20 orang");
      return;
    }

    if (isAvailable === false) {
      setError("Waktu yang dipilih sudah penuh, silakan pilih waktu lain");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reservationData = {
        userId: user.uid,
        name: formData.name,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        guestCount: formData.guestCount,
        note: formData.note,
        status: "menunggu" as const,
      };

      const reservationId = await createReservation(reservationData);

      if (reservationId) {
        setSuccess(true);
        setFormData({
          date: "",
          time: "",
          guestCount: 2,
          name: "",
          phone: "",
          note: "",
        });
      } else {
        setError("Gagal membuat reservasi. Coba lagi.");
      }
    } catch (err) {
      console.error("Error creating reservation:", err);
      setError("Gagal membuat reservasi. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Waktu yang tersedia
  const availableTimes = [
    "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  if (success) {
    return (
      <div className="rounded-2xl border-2 border-sage/30 bg-sage/10 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage text-paper">
          <Check className="h-8 w-8" />
        </div>
        <h3 className="font-display text-2xl text-sage">
          Reservasi Berhasil!
        </h3>
        <p className="mt-3 text-foreground/70">
          Permintaan Anda sedang diproses. Kami akan menghubungi Anda via WhatsApp dalam 30 menit.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-sage/40 bg-sage/10 px-6 py-3 text-sm font-medium text-sage transition-all hover:bg-sage hover:text-paper"
        >
          <Plus className="h-4 w-4" />
          Buat Reservasi Lagi
        </button>
      </div>
    );
  }

  // Belum login: minta login dulu
  if (!authLoading && !user) {
    return (
      <div className="rounded-2xl border-2 border-amber/30 bg-amber/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber/20 text-amber">
          <User className="h-8 w-8" />
        </div>
        <h3 className="font-display text-2xl">Login Dulu, Yuk</h3>
        <p className="mt-2 text-foreground/70">
          Kamu perlu login untuk membuat reservasi meja.
        </p>
        <Link
          href="/login?redirect=/reservasi"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rust px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-rust/90 hover:scale-105"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tanggal & Waktu - Side by Side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Tanggal */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-rust" />
            Tanggal
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className="w-full rounded-xl border-2 border-border-soft bg-background px-4 py-3 text-sm transition-all focus:border-rust focus:outline-none dark:border-border-soft/50 dark:bg-espresso"
            required
          />
        </div>

        {/* Waktu */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-rust" />
            Waktu
          </label>
          <div className="relative">
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border-2 border-border-soft bg-background px-4 py-3 pr-10 text-sm transition-all focus:border-rust focus:outline-none dark:border-border-soft/50 dark:bg-espresso"
              required
            >
              <option value="">Pilih jam</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time} WIB
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
          </div>
          {formData.date && !isAvailable && (
            <p className="text-xs text-rust">⚠️ Waktu ini sudah penuh</p>
          )}
          {isAvailable && formData.date && formData.time && (
            <p className="text-xs text-sage">✓ Tersedia</p>
          )}
        </div>
      </div>

      {/* Jumlah Tamu */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4 text-rust" />
          Jumlah Tamu
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, guestCount: Math.max(1, prev.guestCount - 1) }))}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-border-soft bg-background transition-all hover:border-rust hover:bg-rust/5"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-border-soft bg-background py-2">
            <span className="font-display text-xl font-bold">{formData.guestCount}</span>
            <span className="ml-2 text-sm text-foreground/60">orang</span>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, guestCount: Math.min(20, prev.guestCount + 1) }))}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-border-soft bg-background transition-all hover:border-rust hover:bg-rust/5"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Nama */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Nama Pemesan</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nama lengkap"
          className="w-full rounded-xl border-2 border-border-soft bg-background px-4 py-3 text-sm transition-all focus:border-rust focus:outline-none dark:border-border-soft/50 dark:bg-espresso"
          required
        />
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Nomor WhatsApp</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="08xx-xxxx-xxxx"
          className="w-full rounded-xl border-2 border-border-soft bg-background px-4 py-3 text-sm transition-all focus:border-rust focus:outline-none dark:border-border-soft/50 dark:bg-espresso"
          required
        />
        <p className="flex items-center gap-1.5 text-xs text-foreground/50">
          <Info className="h-3 w-3" />
          Kami akan menghubungi via WhatsApp untuk konfirmasi
        </p>
      </div>

      {/* Catatan */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Catatan (opsional)</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Alergi, moment khusus, atau permintaan lain..."
          rows={2}
          className="w-full rounded-xl border-2 border-border-soft bg-background px-4 py-3 text-sm transition-all focus:border-rust focus:outline-none resize-none dark:border-border-soft/50 dark:bg-espresso"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border-2 border-rust/30 bg-rust/5 p-4 text-sm text-rust">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || isAvailable === false}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-4 text-sm font-semibold text-paper transition-all hover:bg-rust/90 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
            Mengirim...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Konfirmasi Reservasi
          </>
        )}
      </button>

      {/* Info */}
      <div className="flex items-start gap-2 rounded-xl bg-amber/10 p-3 text-xs text-foreground/60">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
        <p>Reservasi tidak memerlukan deposit. Kamu bisa cancel H-1 sebelum jam kedatangan.</p>
      </div>
    </form>
  );
}
