"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Clock, Check, Package, XCircle, ChevronRight, Loader2 } from "lucide-react";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod?: string;
  createdAt: Date;
};

type StatusKey = "menunggu" | "diproses" | "siap" | "selesai" | "dibatalkan";

const statusConfig: Record<StatusKey, { label: string; icon: typeof Clock; bgColor: string }> = {
  menunggu: { label: "Menunggu", icon: Clock, bgColor: "bg-amber-500" },
  diproses: { label: "Diproses", icon: Package, bgColor: "bg-blue-500" },
  siap: { label: "Siap", icon: Check, bgColor: "bg-green-500" },
  selesai: { label: "Selesai", icon: Check, bgColor: "bg-gray-500" },
  dibatalkan: { label: "Dibatalkan", icon: XCircle, bgColor: "bg-red-500" },
};

const statusOrder: StatusKey[] = ["menunggu", "diproses", "siap", "selesai", "dibatalkan"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const q = query(collection(db, "orders"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const raw = d.data();
        // PENTING: spread dulu, baru set id = d.id.
        // Kalau kebalik, field "id" (kode ORD-xxx) di dalam dokumen bakal
        // nimpa document ID asli Firestore, bikin updateDoc gagal.
        return {
          ...raw,
          id: d.id,
          createdAt: raw.createdAt?.toDate() || new Date(),
        };
      }) as Order[];
      
      // FIFO: Urut dari yang TERBARU ke lama (descending)
      // Pesanan terbaru muncul di atas
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function handleStatus(orderId: string, newStatus: StatusKey) {
    setUpdatingStatus(orderId + newStatus);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setNotification({ type: "success", message: `Status berhasil diubah ke ${statusConfig[newStatus].label}` });
    } catch (e) {
      console.error(e);
      setNotification({ type: "error", message: "Gagal update status" });
    } finally {
      setUpdatingStatus(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rust" />
      </div>
    );
  }

  const selected = orders.find((o) => o.id === selectedId);
  const counts = orders.reduce(
    (a, o) => ((a[o.status] = (a[o.status] || 0) + 1), a),
    {} as Record<string, number>
  );

  return (
    <div className="flex h-full gap-6">
      {/* List */}
      <div className="flex-1 space-y-4 overflow-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">Pesanan</h1>
          <span className="rounded-full bg-rust px-3 py-1 text-sm font-medium text-white">
            {orders.length}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedId(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedId === null ? "bg-rust text-white" : "bg-surface text-foreground/70 hover:bg-border-soft"
            }`}
          >
            Semua ({orders.length})
          </button>
          {statusOrder.map((s) => {
            const c = statusConfig[s];
            const cnt = counts[s] || 0;
            if (cnt === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setSelectedId(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedId === s ? `${c.bgColor} text-white` : "bg-surface text-foreground/70 hover:bg-border-soft"
                }`}
              >
                {c.label} ({cnt})
              </button>
            );
          })}
        </div>

        {orders.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-border-soft">
            <p className="text-foreground/50">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const cfg = statusConfig[order.status as StatusKey] || statusConfig.menunggu;
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    selectedId === order.id
                      ? "border-rust bg-rust/5"
                      : "border-border-soft bg-surface hover:border-rust/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{order.id.slice(0, 8)}...</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${cfg.bgColor}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xl font-medium">
                        {order.items.reduce((s, i) => s + i.qty, 0)} item - Rp{order.total.toLocaleString("id-ID")}
                      </p>
                      <p className="mt-1 text-xs text-foreground/50">
                        {order.createdAt.toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-foreground/30" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-80 shrink-0 space-y-4 rounded-2xl border border-border-soft bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono text-sm">Order</h2>
              <p className="text-xs text-foreground/50">{selected.id}</p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="rounded-lg p-1 hover:bg-border-soft"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white ${statusConfig[selected.status as StatusKey]?.bgColor || "bg-gray-500"}`}>
            {selected.status === "menunggu" && <Clock className="h-4 w-4" />}
            {selected.status === "diproses" && <Package className="h-4 w-4" />}
            {(selected.status === "siap" || selected.status === "selesai") && <Check className="h-4 w-4" />}
            {selected.status === "dibatalkan" && <XCircle className="h-4 w-4" />}
            {statusConfig[selected.status as StatusKey]?.label || selected.status}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-foreground/50">Item Pesanan</p>
            {selected.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.qty}
                </span>
                <span className="font-mono">
                  Rp{(item.price * item.qty).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border-soft pt-4">
            <div className="flex justify-between font-display text-xl">
              <span>Total</span>
              <span className="font-mono">Rp{selected.total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-border-soft pt-4">
            <p className="text-xs font-medium uppercase text-foreground/50">Update Status</p>
            <div className="grid grid-cols-2 gap-2">
              {statusOrder
                .filter((s) => s !== selected.status)
                .map((s) => {
                  const cfg = statusConfig[s];
                  const isUpdating = updatingStatus === selected.id + s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatus(selected.id, s)}
                      disabled={isUpdating}
                      className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-all ${cfg.bgColor} ${
                        isUpdating ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : s === "dibatalkan" ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          Batalkan
                        </>
                      ) : (
                        <>
                          <cfg.icon className="h-4 w-4" />
                          {cfg.label}
                        </>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {notification.type === "success" ? <Check className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
