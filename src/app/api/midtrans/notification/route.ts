import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  getPaymentByTransactionId,
  updatePaymentStatus,
  mapMidtransStatusToPaymentStatus,
  extractPaymentMethod,
} from "@/lib/payment";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MidtransNotification } from "@/types/payment";
import type { OrderStatus } from "@/context/CartContext";

const serverKey = process.env.MIDTRANS_SERVER_KEY;

/**
 * Verify signature dari Midtrans notification
 * Signature = SHA512(order_id + status_code + gross_amount + ServerKey)
 */
function verifySignature(notification: MidtransNotification): boolean {
  if (!serverKey) {
    console.error("[Webhook] Server key not configured");
    return false;
  }

  const { order_id, status_code, gross_amount, signature_key } = notification;
  const input = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(input).digest("hex");

  const isValid = hash === signature_key;
  console.log("[Webhook] Signature verification:", isValid ? "VALID" : "INVALID");
  
  return isValid;
}

/**
 * Map Midtrans status ke Order status
 */
function mapPaymentStatusToOrderStatus(
  midtransStatus: string,
  fraudStatus?: string
): OrderStatus {
  // Fraud check
  if (fraudStatus === "deny" || fraudStatus === "challenge") {
    return "dibatalkan";
  }

  switch (midtransStatus) {
    case "capture":
    case "settlement":
      return "sedang_diproses"; // Payment sukses → Order diproses
    case "pending":
    case "authorize":
      return "menunggu_pembayaran"; // Masih pending
    case "deny":
    case "cancel":
    case "failure":
    case "expire":
      return "dibatalkan"; // Gagal/expired → Order dibatalkan
    default:
      return "menunggu_pembayaran";
  }
}

/**
 * Webhook handler untuk Midtrans notification
 * IMPORTANT: Ini adalah sumber kebenaran untuk payment status!
 */
export async function POST(request: Request) {
  console.log("[Webhook] ============================================");
  console.log("[Webhook] Received Midtrans notification at:", new Date().toISOString());

  if (!serverKey) {
    console.error("[Webhook] ❌ Server key not configured!");
    return NextResponse.json(
      { error: "Server key not configured" },
      { status: 500 }
    );
  }

  try {
    const notification: MidtransNotification = await request.json();
    
    console.log("[Webhook] 📦 Notification data:", {
      transaction_id: notification.transaction_id,
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      payment_type: notification.payment_type,
      fraud_status: notification.fraud_status,
      gross_amount: notification.gross_amount,
    });

    // 1. Verify signature untuk security
    const isValidSignature = verifySignature(notification);
    
    if (!isValidSignature) {
      console.error("[Webhook] ❌ Invalid signature!");
      console.error("[Webhook] Expected hash calculation:");
      console.error("[Webhook] Input:", `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey?.substring(0, 10)}...`);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }
    
    console.log("[Webhook] ✅ Signature valid");

    const {
      transaction_id,
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      gross_amount,
      va_numbers,
    } = notification;

    // 2. Cari payment di database berdasarkan transaction_id
    console.log("[Webhook] 🔍 Looking for payment with transaction ID:", order_id);
    const payment = await getPaymentByTransactionId(order_id); // order_id dari Midtrans = transaction_id kita

    if (!payment) {
      console.error("[Webhook] ❌ Payment not found for transaction:", order_id);
      console.error("[Webhook] This could mean:");
      console.error("[Webhook] 1. Payment record not created in database");
      console.error("[Webhook] 2. Transaction ID mismatch");
      console.error("[Webhook] 3. Database query issue");
      
      // Return 200 agar Midtrans tidak retry (idempotency)
      return NextResponse.json({
        status: "payment_not_found",
        message: "Payment record not found in database",
        transaction_id: order_id,
      });
    }

    console.log("[Webhook] ✅ Found payment:", {
      paymentId: payment.id,
      orderId: payment.orderId,
      currentStatus: payment.paymentStatus,
      amount: payment.grossAmount,
    });

    // 3. Check idempotency - jika status sudah PAID, jangan proses lagi
    if (payment.paymentStatus === "PAID") {
      console.log("[Webhook] ⚠️  Payment already PAID, skipping update (idempotency)");
      return NextResponse.json({
        status: "already_processed",
        message: "Payment already marked as paid",
      });
    }

    // 4. Map Midtrans status ke payment status
    const newPaymentStatus = mapMidtransStatusToPaymentStatus(
      transaction_status,
      fraud_status
    );
    
    console.log("[Webhook] 🔄 Status mapping:", {
      midtransStatus: transaction_status,
      newPaymentStatus,
      fraudStatus: fraud_status,
    });

    // 5. Extract payment method dan VA number (jika ada)
    const paymentMethod = extractPaymentMethod(payment_type);
    const vaNumber = va_numbers?.[0]?.va_number || null;

    // 6. Update payment status di database
    console.log("[Webhook] 💾 Updating payment status in database...");
    await updatePaymentStatus({
      paymentId: payment.id,
      paymentStatus: newPaymentStatus,
      paymentMethod,
      vaNumber: vaNumber || undefined,
      fraudStatus: fraud_status,
      midtransStatus: transaction_status,
    });

    console.log("[Webhook] ✅ Payment status updated:", payment.id, "→", newPaymentStatus);

    // 7. Update order status berdasarkan payment status
    const newOrderStatus = mapPaymentStatusToOrderStatus(transaction_status, fraud_status);
    
    console.log("[Webhook] 🔍 Looking for order:", payment.orderId);
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("orderId", "==", payment.orderId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const orderDoc = snapshot.docs[0];
      console.log("[Webhook] 💾 Updating order status in database...");
      console.log("[Webhook] Order Firestore ID:", orderDoc.id);
      console.log("[Webhook] Order ID:", payment.orderId);
      console.log("[Webhook] New status:", newOrderStatus);
      
      await updateDoc(doc(db, "orders", orderDoc.id), {
        status: newOrderStatus,
        transactionStatus: transaction_status,
        lastPaymentMethod: paymentMethod,
        updatedAt: serverTimestamp(),
      });

      console.log("[Webhook] ✅ Order status updated:", orderDoc.id, "→", newOrderStatus);
    } else {
      console.error("[Webhook] ❌ Order not found:", payment.orderId);
      console.error("[Webhook] This is critical! Payment exists but order doesn't.");
    }

    console.log("[Webhook] ============================================");
    console.log("[Webhook] 🎉 SUCCESS! Notification processed successfully");
    console.log("[Webhook] ============================================");

    // 8. Return 200 OK untuk acknowledge Midtrans
    return NextResponse.json({
      status: "success",
      message: "Notification processed",
      payment_status: newPaymentStatus,
      order_status: newOrderStatus,
      payment_id: payment.id,
      order_id: payment.orderId,
    });

  } catch (error) {
    console.error("[Webhook] ============================================");
    console.error("[Webhook] ❌ ERROR processing notification:", error);
    console.error("[Webhook] Stack trace:", error instanceof Error ? error.stack : "N/A");
    console.error("[Webhook] ============================================");
    
    // Return 200 untuk prevent Midtrans retry jika ini adalah error yang tidak bisa di-recover
    // Midtrans akan retry notification hingga 5x jika response bukan 2xx
    return NextResponse.json(
      { 
        status: "error",
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 200 } // Return 200 untuk stop retry dari Midtrans
    );
  }
}

/**
 * GET handler untuk test webhook (development only)
 */
export async function GET() {
  return NextResponse.json({
    message: "Midtrans Webhook Endpoint",
    status: "active",
    note: "This endpoint receives POST notifications from Midtrans",
  });
}
