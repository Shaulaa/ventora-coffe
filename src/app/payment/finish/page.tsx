"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { clearLastTransaction } from "@/lib/snap";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// Update status order di Firestore
// NOTE: Ini adalah fallback untuk client-side redirect
// Webhook adalah sumber kebenaran utama untuk payment status
async function updateOrderStatus(orderId: string, transactionStatus: string) {
  try {
    console.log("[PaymentFinish] ============================================");
    console.log("[PaymentFinish] Updating order status (client-side fallback)");
    console.log("[PaymentFinish] Transaction ID from Midtrans:", orderId);
    console.log("[PaymentFinish] Transaction Status:", transactionStatus);

    // Cari order dengan berbagai format order ID
    const ordersRef = collection(db, "orders");
    
    // Generate possible order ID formats
    const possibleOrderIds = new Set<string>();
    possibleOrderIds.add(orderId); // Original
    
    // Extract ORD-XXX dari VENTORA-ORD-XXX-ABC123-DEF456
    if (orderId.startsWith("VENTORA-")) {
      const withoutVentora = orderId.replace("VENTORA-", "");
      possibleOrderIds.add(withoutVentora); // ORD-XXX-ABC123-DEF456
      
      const parts = withoutVentora.split("-");
      if (parts.length >= 2) {
        // ORD-XXX
        possibleOrderIds.add(`${parts[0]}-${parts[1]}`);
      }
      if (parts.length >= 3) {
        // ORD-XXX-ABC123
        possibleOrderIds.add(`${parts[0]}-${parts[1]}-${parts[2]}`);
      }
      if (parts.length >= 4) {
        // ORD-XXX-ABC123-DEF456
        possibleOrderIds.add(`${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`);
      }
    }
    
    console.log("[PaymentFinish] Trying order IDs:", Array.from(possibleOrderIds));
    
    // Try each possible order ID
    let orderDoc = null;
    let orderRef = null;
    
    for (const tryOrderId of possibleOrderIds) {
      const q = query(ordersRef, where("orderId", "==", tryOrderId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        orderDoc = snapshot.docs[0];
        orderRef = doc(db, "orders", orderDoc.id);
        console.log("[PaymentFinish] ✅ Order found!");
        console.log("[PaymentFinish] Firestore ID:", orderDoc.id);
        console.log("[PaymentFinish] Order ID matched:", tryOrderId);
        break;
      }
    }

    if (!orderDoc || !orderRef) {
      console.error("[PaymentFinish] ❌ Order not found!");
      console.error("[PaymentFinish] Tried order IDs:", Array.from(possibleOrderIds));
      console.error("[PaymentFinish] Possible solutions:");
      console.error("[PaymentFinish] 1. Check Firebase Console → orders collection");
      console.error("[PaymentFinish] 2. Look for order with similar timestamp");
      console.error("[PaymentFinish] 3. Use manual update API with correct order ID");
      return;
    }

    // Tentukan status berdasarkan transaction_status Midtrans
    let newStatus: string;
    switch (transactionStatus) {
      case "settlement":
      case "capture":
        newStatus = "sedang_diproses"; // Sukses → Sedang Diproses
        break;
      case "pending":
        newStatus = "menunggu_pembayaran"; // Pending → Menunggu Pembayaran
        break;
      case "deny":
      case "expire":
      case "cancel":
        newStatus = "dibatalkan"; // Gagal → Dibatalkan
        break;
      default:
        newStatus = "menunggu_pembayaran";
    }

    console.log("[PaymentFinish] Updating order status:", orderDoc.id, "→", newStatus);
    
    await updateDoc(orderRef, {
      status: newStatus,
      transactionStatus: transactionStatus,
      updatedAt: serverTimestamp(),
    });

    console.log("[PaymentFinish] ✅ Order status updated successfully!");
    console.log("[PaymentFinish] ============================================");

  } catch (error) {
    console.error("[PaymentFinish] ============================================");
    console.error("[PaymentFinish] ❌ Error updating order status:", error);
    console.error("[PaymentFinish] ============================================");
  }
}

function PaymentFinishContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "failed">("loading");
  const [orderId, setOrderId] = useState<string>("");
  const [message, setMessage] = useState<string>("Memeriksa status pembayaran...");

  useEffect(() => {
    async function processPaymentStatus() {
      // Ambil parameter dari URL return Midtrans
      const orderIdParam = searchParams.get("order_id");
      const transactionStatus = searchParams.get("transaction_status");
      const statusCode = searchParams.get("status_code");

      console.log("[PaymentFinish] Params:", {
        order_id: orderIdParam,
        transaction_status: transactionStatus,
        status_code: statusCode,
      });

      if (!orderIdParam) {
        // Cek localStorage untuk order yang dibuat via COD/e-wallet
        const pendingOrder = localStorage.getItem("ventora_pending_order");
        if (pendingOrder) {
          const data = JSON.parse(pendingOrder);
          setOrderId(data.orderId || data.orderIdMidtrans || "Unknown");
          // Langsung set success untuk non-Midtrans
          setStatus("success");
          setMessage("Pesanan berhasil dibuat! Pesanan kamu sedang diproses.");
          localStorage.removeItem("ventora_pending_order");
          return;
        }

        setStatus("failed");
        setMessage("Data pembayaran tidak ditemukan. Silakan cek halaman Pesanan.");
        return;
      }

      setOrderId(orderIdParam);

      // Parse status dari Midtrans
      if (transactionStatus) {
        // Cari order di Firestore berdasarkan orderId (Midtrans order_id)
        await updateOrderStatus(orderIdParam, transactionStatus);

        switch (transactionStatus) {
          case "settlement":
          case "capture":
            setStatus("success");
            setMessage("Pembayaran berhasil! Pesanan kamu sedang diproses.");
            // Bersihkan data transaksi sebelumnya
            clearLastTransaction();
            // Simpan info success ke localStorage untuk ditampilkan di halaman Pesanan
            localStorage.setItem("payment_success", JSON.stringify({
              orderId: orderIdParam,
              status: "success",
              timestamp: Date.now(),
            }));
            break;

          case "pending":
            setStatus("pending");
            setMessage("Pembayaran masih menunggu. Selesaikan pembayaran untuk memproses pesanan.");
            localStorage.setItem("payment_pending", JSON.stringify({
              orderId: orderIdParam,
              status: "pending",
              timestamp: Date.now(),
            }));
            break;

          case "deny":
          case "expire":
          case "cancel":
            setStatus("failed");
            setMessage(`Pembayaran ${transactionStatus === "deny" ? "ditolak" : transactionStatus === "expire" ? "kedaluwarsa" : "dibatalkan"}. Silakan coba lagi.`);
            localStorage.setItem("payment_failed", JSON.stringify({
              orderId: orderIdParam,
              status: transactionStatus,
              timestamp: Date.now(),
            }));
            break;

          default:
            setStatus("pending");
            setMessage(`Status: ${transactionStatus}`);
        }
      } else {
        // Fallback: cek localStorage
        const pendingOrder = localStorage.getItem("ventora_pending_order");
        if (pendingOrder) {
          setStatus("pending");
          setMessage("Pembayaran sedang diproses. Cek halaman Pesanan untuk update.");
        } else {
          setStatus("failed");
          setMessage("Status pembayaran tidak diketahui. Silakan cek halaman Pesanan.");
        }
      }
    }

    processPaymentStatus();
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 animate-spin text-amber" />
          <h1 className="text-xl font-semibold">Memeriksa Pembayaran...</h1>
          <p className="text-foreground/60">Mohon tunggu sebentar</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold text-green-600">Pembayaran Berhasil!</h1>
          <p className="text-foreground/70">{message}</p>
          {orderId && (
            <p className="text-sm text-foreground/50">Order ID: {orderId}</p>
          )}
          <Link
            href="/pesanan"
            className="mt-4 rounded-full bg-rust px-6 py-2 text-sm text-paper transition-opacity hover:opacity-90"
          >
            Lihat Pesanan
          </Link>
        </div>
      )}

      {status === "pending" && (
        <div className="flex flex-col items-center gap-4">
          <Clock className="h-16 w-16 text-yellow-500" />
          <h1 className="text-2xl font-bold text-yellow-600">Menunggu Pembayaran</h1>
          <p className="text-foreground/70">{message}</p>
          {orderId && (
            <p className="text-sm text-foreground/50">Order ID: {orderId}</p>
          )}
          <p className="text-sm text-foreground/60">
            Selesaikan pembayaran, lalu refresh halaman ini atau cek halaman Pesanan.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full border border-border-soft px-5 py-2 text-sm transition-colors hover:border-amber"
            >
              Refresh
            </button>
            <Link
              href="/pesanan"
              className="rounded-full bg-rust px-5 py-2 text-sm text-paper transition-opacity hover:opacity-90"
            >
              Lihat Pesanan
            </Link>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold text-red-600">Pembayaran Gagal</h1>
          <p className="text-foreground/70">{message}</p>
          <div className="flex gap-3">
            <Link
              href="/keranjang"
              className="rounded-full bg-rust px-6 py-2 text-sm text-paper transition-opacity hover:opacity-90"
            >
              Kembali ke Keranjang
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentFinishPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-amber" />
          <h1 className="mt-4 text-xl font-semibold">Memuat...</h1>
        </div>
      }
    >
      <PaymentFinishContent />
    </Suspense>
  );
}
