"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, Suspense } from "react";
import { FirestoreOrder, CartItem } from "@/context/CartContext";
import {
  CheckCircle,
  Clock,
  Loader2,
  CreditCard,
  ShoppingBag,
  Receipt,
  ArrowRight,
  Wallet,
  RotateCcw,
  CircleDot,
  ChevronDown,
  Snowflake,
  Candy,
  FileText,
  Plus,
} from "lucide-react";
import { showMidtransPayment, resumeExistingPayment } from "@/lib/snap";
import { getActivePayment, createPayment } from "@/lib/payment";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatJam(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; bg: string; border: string; text: string }> = {
  menunggu_pembayaran: {
    label: "Menunggu Pembayaran",
    icon: <Wallet className="h-4 w-4" />,
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200/50 dark:border-amber-800/50",
    text: "text-amber-700 dark:text-amber-400"
  },
  sedang_diproses: {
    label: "Sedang Diproses",
    icon: <RotateCcw className="h-4 w-4" />,
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200/50 dark:border-blue-800/50",
    text: "text-blue-700 dark:text-blue-400"
  },
  siap: {
    label: "Siap",
    icon: <CircleDot className="h-4 w-4" />,
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200/50 dark:border-green-800/50",
    text: "text-green-700 dark:text-green-400"
  },
  selesai: {
    label: "Selesai",
    icon: <CheckCircle className="h-4 w-4" />,
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  dibatalkan: {
    label: "Dibatalkan",
    icon: <Clock className="h-4 w-4" />,
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200/50 dark:border-red-800/50",
    text: "text-red-700 dark:text-red-400"
  },
};

type StatusKey = string;

// Countdown timer
function PaymentCountdown({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      return Math.max(0, Math.floor((expiry - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono font-medium ${isUrgent ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 animate-pulse" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"}`}>
      <Clock className="h-3 w-3" />
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as StatusKey] || statusConfig.menunggu_pembayaran;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// Order Item Row
function OrderItemRow({ item }: { item: CartItem }) {
  const customization = item.customization;

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Icon & Qty */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-xl dark:bg-espresso">
        {item.icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{item.name}</p>
          <span className="shrink-0 rounded-full bg-rust/10 px-2 py-0.5 text-xs font-medium text-rust dark:bg-rust/20">
            x{item.qty}
          </span>
        </div>

        {/* Customization tags - plain text, no icons */}
        {(customization?.size || customization?.beans || customization?.ice === "less" || customization?.ice === "no" || customization?.sugar === "less" || customization?.sugar === "no" || customization?.additional?.length) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
            {customization?.size && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300 capitalize">
                {customization.size}
              </span>
            )}
            {customization?.beans && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 capitalize">
                {customization.beans}
              </span>
            )}
            {(customization?.ice === "less" || customization?.ice === "no") && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Less Ice
              </span>
            )}
            {(customization?.sugar === "less" || customization?.sugar === "no") && (
              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                Less Sugar
              </span>
            )}
            {customization?.additional?.map((add, i) => (
              <span key={i} className="rounded-full bg-sage/20 px-2 py-0.5 text-sage dark:bg-sage/30 capitalize">
                + {add}
              </span>
            ))}
          </div>
        )}

        {/* Note */}
        {customization?.notes && (
          <p className="mt-1 text-xs italic text-foreground/50">
            &quot;{customization.notes}&quot;
          </p>
        )}
      </div>

      {/* Price */}
      <p className="shrink-0 font-mono text-sm font-medium">
        {formatRupiah(item.price * item.qty)}
      </p>
    </div>
  );
}

// Order Card
function OrderCard({
  order,
  onBayar,
  isProcessing,
  isExpanded,
  onToggle,
}: {
  order: FirestoreOrder;
  onBayar: (order: FirestoreOrder) => void;
  isProcessing: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cfg = statusConfig[order.status as StatusKey] || statusConfig.menunggu_pembayaran;
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
  const showCountdown = order.status === "menunggu_pembayaran" && order.expiresAt && new Date(order.expiresAt) > new Date();

  return (
    <div className={`overflow-hidden rounded-2xl border border-border-soft bg-surface dark:bg-espresso transition-all shadow-sm hover:shadow-md`}>
      {/* Header - Clickable */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-border-soft/30"
      >
        <div className="flex items-center gap-3">
          {/* Status Icon - Neutral background */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-border-soft/50">
            <span className={cfg.text}>{cfg.icon}</span>
          </div>
          <div>
            <p className="font-mono text-xs text-foreground/50">#{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="font-display text-lg font-semibold">{itemCount} item</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-lg font-bold text-rust">{formatRupiah(order.total)}</p>
            <p className="text-xs text-foreground/50">{formatTanggal(order.createdAt)} · {formatJam(order.createdAt)}</p>
          </div>
          <ChevronDown className={`h-5 w-5 text-foreground/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border-soft bg-surface-light dark:bg-espresso-light">
          {/* Status Badge */}
          <div className="px-4 pt-4">
            <StatusBadge status={order.status} />
          </div>

          {/* Items */}
          <div className="px-4 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">Item Pesanan</p>
            <div className="divide-y divide-border-soft">
              {order.items.map((item, idx) => (
                <OrderItemRow key={idx} item={item} />
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-border-soft bg-surface-light px-4 py-3 mt-2 dark:bg-espresso-light">
            <span className="font-display font-semibold">Total</span>
            <span className="font-mono text-lg font-bold text-rust">{formatRupiah(order.total)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4">
            <div />

            <div className="flex items-center gap-2">
              {showCountdown && order.expiresAt && (
                <PaymentCountdown expiresAt={new Date(order.expiresAt)} />
              )}
              {order.status === "menunggu_pembayaran" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBayar(order);
                  }}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-full bg-rust px-5 py-2.5 text-sm font-semibold text-paper transition-all hover:bg-rust/90 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Bayar Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface dark:bg-espresso">
        <Receipt className="h-12 w-12 text-foreground/20" />
      </div>
      <h3 className="font-display text-xl font-semibold">Belum Ada Pesanan</h3>
      <p className="mt-2 max-w-xs text-sm text-foreground/60">
        Yuk mulai pesan kopi favoritmu dan nikmati suasana nyaman di Ventora
      </p>
      <Link
        href="/menu"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-rust px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-rust/90"
      >
        Lihat Menu
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// Login Prompt
function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface dark:bg-espresso">
        <ShoppingBag className="h-12 w-12 text-foreground/20" />
      </div>
      <h3 className="font-display text-xl font-semibold">Login untuk Melihat Pesanan</h3>
      <p className="mt-2 max-w-xs text-sm text-foreground/60">
        Masuk atau daftar untuk melihat riwayat pesanan dan lacak pesanan aktif
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/login"
          className="rounded-full bg-rust px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-rust/90"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-border-soft px-6 py-3 text-sm font-medium transition-all hover:border-rust hover:text-rust"
        >
          Daftar
        </Link>
      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface dark:bg-espresso" />
      ))}
    </div>
  );
}

function PesananContent() {
  const searchParams = useSearchParams();
  const isCheckoutSuccess = searchParams.get("checkout") === "success";
  const { firestoreOrders, isLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const paymentSuccess = localStorage.getItem("payment_success");

    if (paymentSuccess) {
      const data = JSON.parse(paymentSuccess);
      if (Date.now() - data.timestamp < 60000) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          localStorage.removeItem("payment_success");
        }, 5000);
      }
    }
    localStorage.removeItem("payment_pending");
  }, []);

  useEffect(() => {
    if (isCheckoutSuccess) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [isCheckoutSuccess]);

  // Auto-cancel expired orders
  useEffect(() => {
    const checkExpiredOrders = async () => {
      const now = new Date();
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      for (const order of firestoreOrders) {
        if (order.status === "menunggu_pembayaran" && order.expiresAt) {
          if (now > new Date(order.expiresAt)) {
            await updateDoc(doc(db, "orders", order.id), {
              status: "dibatalkan",
              cancelReason: "Pembayaran kadaluarsa",
              cancelledAt: new Date().toISOString(),
            });
          }
        }
      }
    };

    if (user && firestoreOrders.length > 0) {
      checkExpiredOrders();
    }
  }, [user, firestoreOrders]);

  /**
   * Handle payment retry - RESUME existing payment jika masih valid
   * Hanya create payment BARU jika payment sebelumnya sudah EXPIRED
   */
  async function handleBayarSekarang(order: FirestoreOrder) {
    if (!user || !order.orderId) return;

    setIsProcessing(order.id);

    try {
      console.log("[Pesanan] User clicked Bayar Sekarang for order:", order.orderId);

      // 1. Cek apakah order ini punya active payment
      const existingPayment = await getActivePayment(order.orderId);

      if (existingPayment) {
        // Payment masih valid dan belum expired - RESUME payment
        console.log("[Pesanan] Found existing payment, resuming:", existingPayment.id);
        console.log("[Pesanan] Payment status:", existingPayment.paymentStatus);
        console.log("[Pesanan] Expires at:", existingPayment.expiresAt);

        if (existingPayment.paymentUrl) {
          // Resume payment dengan URL yang sudah ada
          await resumeExistingPayment(existingPayment.paymentUrl);
          
          // Redirect ke finish page untuk monitoring
          window.location.href = "/payment/finish";
        } else {
          console.error("[Pesanan] Payment URL not found, creating new payment");
          // Fallback: create new payment
          await createNewPayment(order);
        }
      } else {
        // Tidak ada payment yang active (expired/failed) - CREATE new payment
        console.log("[Pesanan] No active payment found, creating new payment");
        await createNewPayment(order);
      }
    } catch (error) {
      console.error("[Pesanan] Error handling payment:", error);
      setIsProcessing(null);
      alert("Gagal memproses pembayaran. Silakan coba lagi.");
    }
  }

  /**
   * Create new payment transaction (untuk payment expired/failed)
   */
  async function createNewPayment(order: FirestoreOrder) {
    if (!user || !order.orderId) return;

    try {
      console.log("[Pesanan] Creating NEW payment for order:", order.orderId);

      const itemDetails = order.items.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.qty,
        name: item.name,
      }));

      // 1. Create Midtrans transaction
      const paymentData = await showMidtransPayment({
        orderId: order.orderId,
        totalAmount: order.total,
        customerDetails: {
          firstName: user.email?.split("@")[0] || "Customer",
          email: user.email || "",
          phone: "081234567890",
        },
        itemDetails,
        onTransactionFinished: () => {
          window.location.href = "/payment/finish";
        },
        onTransactionPending: () => {
          window.location.href = "/payment/finish";
        },
        onTransactionError: () => {
          setIsProcessing(null);
        },
      });

      // 2. Save payment record ke database
      await createPayment({
        orderId: order.orderId,
        grossAmount: order.total,
        snapToken: paymentData.token,
        paymentUrl: paymentData.redirectUrl,
        expiresInHours: 24,
      });

      console.log("[Pesanan] New payment created, redirecting...");

      // 3. Redirect ke finish page
      window.location.href = "/payment/finish";
    } catch (error) {
      console.error("[Pesanan] Error creating new payment:", error);
      setIsProcessing(null);
      throw error;
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-3xl px-4 py-12">
          <LoadingSkeleton />
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-slide-down">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-6 py-3 text-white shadow-xl">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">Pesanan berhasil dibuat!</p>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-3xl px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border-soft px-4 py-2.5 text-sm font-medium transition-all hover:border-rust hover:bg-rust/5 hover:text-rust"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Kembali ke Beranda
          </Link>
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Pesanan Saya</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {authLoading ? "Memuat..." : user ? `${firestoreOrders.length} pesanan` : "Login untuk melihat pesanan"}
          </p>
        </div>

        {/* Content */}
        {authLoading ? (
          <LoadingSkeleton />
        ) : !user ? (
          <LoginPrompt />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : firestoreOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {firestoreOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onBayar={handleBayarSekarang}
                isProcessing={isProcessing === order.id}
                isExpanded={expandedOrder === order.id}
                onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function PesananPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-3xl px-4 py-12">
          <LoadingSkeleton />
        </section>
      </div>
    }>
      <PesananContent />
    </Suspense>
  );
}
