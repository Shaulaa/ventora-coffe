// Payment Service - Database operations untuk payments collection
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  FirestorePayment,
  PaymentStatus,
  PaymentMethod,
  MidtransTransactionStatus,
} from "@/types/payment";

/**
 * Generate transaction ID untuk Midtrans
 * IMPORTANT: Order ID sudah unique (ORD-XXX-YYY)
 * Kita hanya perlu tambah prefix VENTORA
 * 
 * Format:
 * - Order ID: ORD-MTJRKX9C-JGIP40
 * - Transaction ID: VENTORA-ORD-MTJRKX9C-JGIP40
 */
export function generateTransactionId(orderId: string): string {
  // Order ID sudah unique, just add prefix
  return `VENTORA-${orderId}`;
}

/**
 * Create payment transaction di Firestore
 */
export async function createPayment(params: {
  orderId: string;
  grossAmount: number;
  snapToken: string;
  paymentUrl: string;
  expiresInHours?: number;
}): Promise<string> {
  const { orderId, grossAmount, snapToken, paymentUrl, expiresInHours = 24 } = params;

  const transactionId = generateTransactionId(orderId);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const paymentData = {
    orderId,
    transactionId,
    paymentMethod: null,
    paymentStatus: "PENDING" as PaymentStatus,
    snapToken,
    paymentUrl,
    vaNumber: null,
    qrString: null,
    grossAmount,
    expiresAt: expiresAt.toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const paymentRef = await addDoc(collection(db, "payments"), paymentData);
  console.log("[Payment Service] Payment created:", paymentRef.id, "for order:", orderId);

  return paymentRef.id;
}

/**
 * Get active payment untuk order tertentu
 * Returns payment yang masih PENDING dan belum expired
 */
export async function getActivePayment(orderId: string): Promise<FirestorePayment | null> {
  try {
    const paymentsRef = collection(db, "payments");
    
    // Query tanpa orderBy untuk menghindari index requirement
    // Kita akan sort manual di client-side
    const q = query(
      paymentsRef,
      where("orderId", "==", orderId),
      where("paymentStatus", "==", "PENDING")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("[Payment Service] No active payment found for order:", orderId);
      return null;
    }

    // Sort manual by createdAt (descending) dan ambil yang terbaru
    const sortedDocs = snapshot.docs.sort((a, b) => {
      const aCreated = a.data().createdAt;
      const bCreated = b.data().createdAt;
      
      const aTime = aCreated instanceof Timestamp ? aCreated.toMillis() : new Date(aCreated).getTime();
      const bTime = bCreated instanceof Timestamp ? bCreated.toMillis() : new Date(bCreated).getTime();
      
      return bTime - aTime; // Descending
    });

    const paymentDoc = sortedDocs[0];
    const data = paymentDoc.data();

    // Parse Firestore Timestamp
    const expiresAt = data.expiresAt instanceof Timestamp 
      ? data.expiresAt.toDate() 
      : new Date(data.expiresAt);
    
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt);

    // Check if expired
    if (expiresAt < new Date()) {
      console.log("[Payment Service] Payment expired for order:", orderId);
      // Update status to EXPIRED
      await updateDoc(doc(db, "payments", paymentDoc.id), {
        paymentStatus: "EXPIRED",
        updatedAt: serverTimestamp(),
      });
      return null;
    }

    const payment: FirestorePayment = {
      id: paymentDoc.id,
      orderId: data.orderId,
      transactionId: data.transactionId,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      snapToken: data.snapToken,
      paymentUrl: data.paymentUrl,
      vaNumber: data.vaNumber,
      qrString: data.qrString,
      grossAmount: data.grossAmount,
      expiresAt,
      createdAt,
      updatedAt,
      fraudStatus: data.fraudStatus,
      currency: data.currency,
      midtransStatus: data.midtransStatus,
    };

    console.log("[Payment Service] Active payment found:", payment.id);
    return payment;
  } catch (error) {
    console.error("[Payment Service] Error getting active payment:", error);
    return null;
  }
}

/**
 * Get payment by transaction ID (untuk webhook)
 */
export async function getPaymentByTransactionId(
  transactionId: string
): Promise<FirestorePayment | null> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("transactionId", "==", transactionId));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("[Payment Service] No payment found for transaction:", transactionId);
      return null;
    }

    // Ambil document pertama (harusnya cuma 1)
    const paymentDoc = snapshot.docs[0];
    const data = paymentDoc.data();

    const expiresAt = data.expiresAt instanceof Timestamp
      ? data.expiresAt.toDate()
      : new Date(data.expiresAt);

    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt);

    const updatedAt = data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt);

    const payment: FirestorePayment = {
      id: paymentDoc.id,
      orderId: data.orderId,
      transactionId: data.transactionId,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      snapToken: data.snapToken,
      paymentUrl: data.paymentUrl,
      vaNumber: data.vaNumber,
      qrString: data.qrString,
      grossAmount: data.grossAmount,
      expiresAt,
      createdAt,
      updatedAt,
      fraudStatus: data.fraudStatus,
      currency: data.currency,
      midtransStatus: data.midtransStatus,
    };

    return payment;
  } catch (error) {
    console.error("[Payment Service] Error getting payment by transaction ID:", error);
    return null;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(params: {
  paymentId: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  vaNumber?: string;
  qrString?: string;
  fraudStatus?: string;
  midtransStatus?: MidtransTransactionStatus;
}): Promise<void> {
  const {
    paymentId,
    paymentStatus,
    paymentMethod,
    vaNumber,
    qrString,
    fraudStatus,
    midtransStatus,
  } = params;

  const updateData: Record<string, unknown> = {
    paymentStatus,
    updatedAt: serverTimestamp(),
  };

  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  if (vaNumber) updateData.vaNumber = vaNumber;
  if (qrString) updateData.qrString = qrString;
  if (fraudStatus) updateData.fraudStatus = fraudStatus;
  if (midtransStatus) updateData.midtransStatus = midtransStatus;

  await updateDoc(doc(db, "payments", paymentId), updateData);
  console.log("[Payment Service] Payment status updated:", paymentId, "→", paymentStatus);
}

/**
 * Map Midtrans transaction status ke internal payment status
 */
export function mapMidtransStatusToPaymentStatus(
  transactionStatus: MidtransTransactionStatus,
  fraudStatus?: string
): PaymentStatus {
  // Jika fraud_status = "deny", langsung FAILED
  if (fraudStatus === "deny" || fraudStatus === "challenge") {
    return "FAILED";
  }

  switch (transactionStatus) {
    case "capture":
    case "settlement":
      return "PAID";
    case "pending":
    case "authorize":
      return "PENDING";
    case "deny":
    case "cancel":
    case "failure":
      return "FAILED";
    case "expire":
      return "EXPIRED";
    case "refund":
    case "partial_refund":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

/**
 * Extract payment method dari Midtrans payment_type
 */
export function extractPaymentMethod(paymentType: string): PaymentMethod {
  const type = paymentType.toLowerCase();
  
  if (type.includes("qris")) return "qris";
  if (type.includes("gopay")) return "gopay";
  if (type.includes("shopeepay")) return "shopeepay";
  if (type.includes("bca")) return "bca_va";
  if (type.includes("bni")) return "bni_va";
  if (type.includes("bri")) return "bri_va";
  if (type.includes("mandiri") || type.includes("echannel")) return "mandiri_va";
  if (type.includes("permata")) return "permata_va";
  if (type.includes("credit") || type.includes("card")) return "credit_card";
  
  return "other";
}
