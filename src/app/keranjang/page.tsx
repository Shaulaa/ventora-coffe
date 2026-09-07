"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { showMidtransPayment, clearLastTransaction } from "@/lib/snap";
import { createPayment } from "@/lib/payment";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function KeranjangPage() {
  const {
    items,
    updateQty,
    removeItem,
    totalPrice,
    clearCart,
    isLoading: cartLoading,
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleCheckout() {
    if (!user) {
      const returnUrl = encodeURIComponent("/keranjang");
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    if (items.length === 0) return;

    setIsProcessing(true);
    setError("");

    try {
      console.log("[Keranjang] Creating new order...");
      
      // Generate STATIC order ID (tidak berubah saat retry)
      const uniqueOrderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const itemDetails = items.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.qty,
        name: item.name,
      }));

      // Bersihkan items dari undefined values
      const cleanedItems = items.map((item) => {
        let cleanedCustomization = null;
        if (item.customization) {
          cleanedCustomization = {
            size: item.customization.size || null,
            beans: item.customization.beans || null,
            ice: item.customization.ice || null,
            sugar: item.customization.sugar || null,
            additional: item.customization.additional || null,
            notes: item.customization.notes || null,
          };
        }

        return {
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          icon: item.icon || null,
          qty: item.qty,
          customization: cleanedCustomization,
        };
      });

      // 1. Create Order di Firestore
      const orderData: Record<string, unknown> = {
        userId: user.uid,
        items: cleanedItems,
        total: totalPrice,
        status: "menunggu_pembayaran",
        paymentMethod: "midtrans",
        notes: "",
        orderId: uniqueOrderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);
      console.log("[Keranjang] Order created:", orderRef.id);

      // 2. Create Payment Transaction via Midtrans
      console.log("[Keranjang] Creating payment transaction...");
      const paymentData = await showMidtransPayment({
        orderId: uniqueOrderId,
        totalAmount: totalPrice,
        customerDetails: {
          firstName: user.email?.split("@")[0] || "Customer",
          email: user.email || "",
          phone: "081234567890",
        },
        itemDetails,
        onTransactionFinished: (result) => {
          console.log("[Keranjang] Payment finished:", result);
          clearLastTransaction();
          clearCart();
          router.push("/payment/finish");
        },
        onTransactionPending: (result) => {
          console.log("[Keranjang] Payment pending:", result);
          clearCart();
          router.push("/payment/finish");
        },
        onTransactionError: (result) => {
          console.error("[Keranjang] Payment error:", result);
          setError("Pembayaran gagal. Silakan coba lagi.");
          setIsProcessing(false);
        },
      });

      // 3. Save Payment Record ke Firestore
      console.log("[Keranjang] Saving payment record...");
      await createPayment({
        orderId: uniqueOrderId,
        grossAmount: totalPrice,
        snapToken: paymentData.token,
        paymentUrl: paymentData.redirectUrl,
        expiresInHours: 24, // Payment expires dalam 24 jam
      });

      // 4. Simpan pending order info ke localStorage (untuk tracking)
      localStorage.setItem("ventora_pending_order", JSON.stringify({
        orderId: orderRef.id,
        orderIdMidtrans: uniqueOrderId,
        items: cleanedItems,
        total: totalPrice,
        timestamp: Date.now(),
      }));

      console.log("[Keranjang] Payment created successfully, redirecting...");
      
      // Clear cart dan redirect ke finish page
      clearCart();
      router.push("/payment/finish");

    } catch (err) {
      console.error("[Keranjang] Error:", err);
      setError("Gagal memproses pesanan. Silakan coba lagi.");
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-rust" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-rust" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-display text-lg">Membuka Pembayaran</p>
              <p className="mt-1 text-sm text-foreground/60">Mohon tunggu sebentar...</p>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-screen-lg px-6 py-16">
        <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
          Keranjang
        </p>
        <h1 className="mt-1 font-display text-4xl">Pesanan kamu</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border-soft p-10 text-center">
            <p className="text-foreground/70">Keranjang kamu masih kosong.</p>
            <Link
              href="/menu"
              className="mt-4 inline-block rounded-full bg-rust px-6 py-2.5 text-sm text-paper hover:opacity-90"
            >
              Lihat Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="mb-4 mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 dark:border-border-soft/50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper-dim text-2xl dark:bg-espresso">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg">{item.name}</p>
                    <p className="font-data text-sm text-foreground/60">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border-soft hover:border-amber dark:border-border-soft/50"
                      aria-label={`Kurangi ${item.name}`}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-data text-sm">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border-soft hover:border-amber dark:border-border-soft/50"
                      aria-label={`Tambah ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Hapus ${item.name}`}
                    className="ml-2 text-foreground/40 hover:text-rust"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border-soft pt-6">
              <span className="font-display text-xl">Total</span>
              <span className="font-data text-xl">{formatRupiah(totalPrice)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing || cartLoading || items.length === 0}
              className="mt-6 w-full rounded-full bg-rust py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Membuka Pembayaran...
                </span>
              ) : (
                "Checkout Sekarang"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-foreground/50">
              Klik untuk membuka halaman pembayaran Midtrans
            </p>
          </>
        )}
      </section>
    </div>
  );
}
