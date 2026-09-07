import { NextResponse } from "next/server";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPaymentByTransactionId, updatePaymentStatus } from "@/lib/payment";

/**
 * Manual update order status - untuk testing/emergency
 * Development/Admin only!
 * 
 * Usage:
 * POST /api/manual-update-status
 * Body: { orderId: "ORD-001", status: "sedang_diproses" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderStatus, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId required" },
        { status: 400 }
      );
    }

    console.log("[Manual Update] Updating order:", orderId);
    console.log("[Manual Update] Order status:", orderStatus);
    console.log("[Manual Update] Payment status:", paymentStatus);

    // 1. Update Order if orderStatus provided
    if (orderStatus) {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("orderId", "==", orderId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      const orderDoc = snapshot.docs[0];
      await updateDoc(doc(db, "orders", orderDoc.id), {
        status: orderStatus,
        updatedAt: serverTimestamp(),
      });

      console.log("[Manual Update] ✅ Order status updated:", orderDoc.id, "→", orderStatus);
    }

    // 2. Update Payment if paymentStatus provided
    if (paymentStatus) {
      // Find payment by orderId
      const paymentsRef = collection(db, "payments");
      const pq = query(paymentsRef, where("orderId", "==", orderId));
      const pSnapshot = await getDocs(pq);

      if (!pSnapshot.empty) {
        const paymentDoc = pSnapshot.docs[0];
        await updatePaymentStatus({
          paymentId: paymentDoc.id,
          paymentStatus: paymentStatus,
        });

        console.log("[Manual Update] ✅ Payment status updated:", paymentDoc.id, "→", paymentStatus);
      } else {
        console.log("[Manual Update] ⚠️  Payment not found for order:", orderId);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      orderId,
      orderStatus,
      paymentStatus,
    });

  } catch (error) {
    console.error("[Manual Update] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to update status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint untuk manual update via query params
 * Usage: /api/manual-update-status?orderId=ORD-001&orderStatus=sedang_diproses&paymentStatus=PAID
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const orderStatus = searchParams.get("orderStatus");
  const paymentStatus = searchParams.get("paymentStatus");

  if (!orderId) {
    return NextResponse.json(
      { error: "orderId required" },
      { status: 400 }
    );
  }

  // Forward to POST
  const url = new URL("/api/manual-update-status", request.url);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, orderStatus, paymentStatus }),
  });

  return response;
}
