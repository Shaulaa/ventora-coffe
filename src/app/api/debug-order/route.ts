import { NextResponse } from "next/server";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Debug endpoint untuk cek order dan payment details
 * Usage: /api/debug-order?orderId=ORD-001
 * Or: /api/debug-order?amount=155000
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  try {
    // 1. Find orders
    const ordersRef = collection(db, "orders");
    let ordersQuery;
    
    if (orderId) {
      ordersQuery = query(ordersRef, where("orderId", "==", orderId));
    } else if (amount) {
      ordersQuery = query(ordersRef, where("total", "==", parseInt(amount)));
    } else {
      // Get latest orders
      ordersQuery = query(ordersRef, orderBy("createdAt", "desc"), limit(5));
    }

    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    // 2. Find payments for these orders
    const payments = [];
    for (const order of orders) {
      const paymentsRef = collection(db, "payments");
      const paymentsQuery = query(
        paymentsRef,
        where("orderId", "==", order.orderId || order.id)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      for (const paymentDoc of paymentsSnapshot.docs) {
        payments.push({
          firestoreId: paymentDoc.id,
          ...paymentDoc.data(),
          createdAt: paymentDoc.data().createdAt?.toDate?.()?.toISOString() || paymentDoc.data().createdAt,
          expiresAt: paymentDoc.data().expiresAt?.toDate?.()?.toISOString() || paymentDoc.data().expiresAt,
        });
      }
    }

    return NextResponse.json({
      query: {
        orderId,
        amount,
      },
      ordersFound: orders.length,
      paymentsFound: payments.length,
      orders,
      payments,
      instructions: {
        updateStatus: `/api/manual-update-status?orderId=${orders[0]?.orderId || 'ORDER-ID'}&orderStatus=sedang_diproses&paymentStatus=PAID`,
        testWebhook: `/api/test-webhook?orderId=${payments[0]?.transactionId || 'TRANSACTION-ID'}&status=settlement&amount=${orders[0]?.total || 50000}`,
      },
    });

  } catch (error) {
    return NextResponse.json({
      error: "Failed to debug order",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
