"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2, CalendarCheck } from "lucide-react";
import {
  subscribeAllReservations,
  updateReservationStatus,
  type Reservation,
  type ReservationStatus,
} from "@/lib/firestore-reservations";

const statusStyles: Record<ReservationStatus, string> = {
  menunggu: "bg-amber/20 text-amber",
  dikonfirmasi: "bg-sage/20 text-sage",
  ditolak: "bg-rust/20 text-rust",
  selesai: "bg-gray-500/20 text-gray-500",
  dibatalkan: "bg-rust/20 text-rust",
};

const statusLabels: Record<ReservationStatus, string> = {
  menunggu: "Menunggu",
  dikonfirmasi: "Dikonfirmasi",
  ditolak: "Ditolak",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const unsub = subscribeAllReservations((data) => {
      setReservations(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function handleStatus(id: string, status: ReservationStatus) {
    setUpdatingId(id + status);
    const ok = await updateReservationStatus(id, status);
    setNotification(
      ok
        ? { type: "success", message: `Status diubah ke ${statusLabels[status]}` }
        : { type: "error", message: "Gagal update status reservasi" }
    );
    setUpdatingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">Manajemen Reservasi</h2>
        <p className="mt-2 text-foreground/70">
          Kelola semua reservasi meja dari pelanggan. Ter-update real-time.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rust" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-soft bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso/5 text-foreground/70 dark:bg-espresso-light/50">
              <tr>
                <th className="px-6 py-4 font-medium">Pelanggan</th>
                <th className="px-6 py-4 font-medium">WhatsApp</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium">Tamu</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {reservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-foreground/60"
                  >
                    <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-foreground/20" />
                    Belum ada reservasi.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-espresso/5 dark:hover:bg-espresso-light/5"
                  >
                    <td className="px-6 py-4 font-medium">
                      {r.name || r.userId}
                      {r.note && (
                        <p className="mt-0.5 text-xs font-normal text-foreground/50">
                          {r.note}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">{r.phone || "-"}</td>
                    <td className="px-6 py-4">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                      }).format(new Date(r.date))}
                    </td>
                    <td className="px-6 py-4">{r.time}</td>
                    <td className="px-6 py-4">{r.guestCount} orang</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[r.status] || "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {statusLabels[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {r.status === "menunggu" && (
                          <>
                            <button
                              onClick={() => handleStatus(r.id, "dikonfirmasi")}
                              disabled={updatingId === r.id + "dikonfirmasi"}
                              className="flex items-center gap-1 rounded-lg bg-sage/10 px-3 py-1.5 text-xs font-medium text-sage transition-colors hover:bg-sage hover:text-white disabled:opacity-50"
                              aria-label="Konfirmasi reservasi"
                            >
                              {updatingId === r.id + "dikonfirmasi" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Konfirmasi
                            </button>
                            <button
                              onClick={() => handleStatus(r.id, "ditolak")}
                              disabled={updatingId === r.id + "ditolak"}
                              className="flex items-center gap-1 rounded-lg bg-rust/10 px-3 py-1.5 text-xs font-medium text-rust transition-colors hover:bg-rust hover:text-white disabled:opacity-50"
                              aria-label="Tolak reservasi"
                            >
                              {updatingId === r.id + "ditolak" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              Tolak
                            </button>
                          </>
                        )}
                        {r.status === "dikonfirmasi" && (
                          <button
                            onClick={() => handleStatus(r.id, "selesai")}
                            disabled={updatingId === r.id + "selesai"}
                            className="flex items-center gap-1 rounded-lg bg-gray-500/10 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-500 hover:text-white disabled:opacity-50"
                            aria-label="Tandai selesai"
                          >
                            {updatingId === r.id + "selesai" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Selesai
                          </button>
                        )}
                        {(r.status === "ditolak" ||
                          r.status === "selesai" ||
                          r.status === "dibatalkan") && (
                          <span className="text-xs text-foreground/40">
                            Tidak ada aksi
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-lg ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
