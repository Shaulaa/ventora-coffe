"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Users, Loader2, X, CheckCircle, Hourglass, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeUserReservations,
  cancelReservation,
  type Reservation,
  type ReservationStatus,
} from "@/lib/firestore-reservations";

const statusConfig: Record<
  ReservationStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  menunggu: {
    label: "Menunggu Konfirmasi",
    bg: "bg-amber/10",
    text: "text-amber",
    border: "border-amber/30",
    icon: <Hourglass className="h-3 w-3" />
  },
  dikonfirmasi: {
    label: "Dikonfirmasi",
    bg: "bg-sage/10",
    text: "text-sage",
    border: "border-sage/30",
    icon: <CheckCircle className="h-3 w-3" />
  },
  ditolak: {
    label: "Ditolak",
    bg: "bg-rust/10",
    text: "text-rust",
    border: "border-rust/30",
    icon: <X className="h-3 w-3" />
  },
  selesai: {
    label: "Selesai",
    bg: "bg-gray-500/10",
    text: "text-gray-500",
    border: "border-gray-500/30",
    icon: <CheckCircle className="h-3 w-3" />
  },
  dibatalkan: {
    label: "Dibatalkan",
    bg: "bg-rust/10",
    text: "text-rust",
    border: "border-rust/30",
    icon: <X className="h-3 w-3" />
  },
};

function formatTanggal(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString("id-ID", { weekday: "long" });
    const dateNum = date.toLocaleDateString("id-ID", { day: "numeric" });
    const month = date.toLocaleDateString("id-ID", { month: "long" });
    const year = date.toLocaleDateString("id-ID", { year: "numeric" });
    return `${day}, ${dateNum} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function formatJam(time: string) {
  return `${time} WIB`;
}

export default function MyReservations() {
  const { user, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setReservations([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsub = subscribeUserReservations(user.uid, (data) => {
      setReservations(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user]);

  async function handleCancel(id: string) {
    setCancelingId(id);
    await cancelReservation(id);
    setCancelingId(null);
  }

  if (authLoading || !user) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-xl">
      <div className="bg-gradient-to-r from-espresso to-espresso-light p-6">
        <h2 className="flex items-center gap-2 font-display text-xl text-paper">
          <ClipboardList className="h-5 w-5" />
          Reservasi Saya
        </h2>
        <p className="mt-1 text-sm text-paper/70">
          Daftar reservasi kamu, ter-update secara real-time
        </p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-rust" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border-soft p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/5">
              <Calendar className="h-6 w-6 text-foreground/30" />
            </div>
            <p className="text-foreground/60">Belum ada reservasi</p>
            <p className="mt-1 text-sm text-foreground/40">
              Buat reservasi pertamamu di atas
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => {
              const cfg = statusConfig[r.status] || statusConfig.menunggu;
              const bisaDibatalkan =
                r.status === "menunggu" || r.status === "dikonfirmasi";
              return (
                <div
                  key={r.id}
                  className={`relative overflow-hidden rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-5 transition-all`}
                >
                  {/* Status Badge */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    {bisaDibatalkan && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={cancelingId === r.id}
                        className="flex items-center gap-1.5 rounded-lg border border-rust/30 px-3 py-1.5 text-xs font-medium text-rust transition-all hover:bg-rust hover:text-paper disabled:opacity-50"
                      >
                        {cancelingId === r.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        Batalkan
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background">
                        <Calendar className="h-4 w-4 text-rust" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50">Tanggal</p>
                        <p className="font-medium">{formatTanggal(r.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background">
                        <Clock className="h-4 w-4 text-amber" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50">Waktu</p>
                        <p className="font-medium">{formatJam(r.time)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background">
                        <Users className="h-4 w-4 text-sage" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50">Jumlah</p>
                        <p className="font-medium">{r.guestCount} orang</p>
                      </div>
                    </div>
                  </div>

                  {r.note && (
                    <div className="mt-3 rounded-xl bg-background/50 p-3">
                      <p className="text-xs text-foreground/50">Catatan</p>
                      <p className="text-sm">{r.note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
