// Payment Types untuk Ventora Coffee
// Memisahkan Order dan Payment untuk state management yang lebih baik

export type PaymentStatus = 
  | "PENDING"      // Menunggu pembayaran
  | "PAID"         // Sudah dibayar (settlement/capture)
  | "EXPIRED"      // Kadaluarsa (24 jam)
  | "FAILED"       // Gagal (deny/cancel)
  | "CANCELLED";   // Dibatalkan oleh user

export type PaymentMethod = 
  | "qris"
  | "gopay"
  | "shopeepay"
  | "bca_va"
  | "bni_va"
  | "bri_va"
  | "mandiri_va"
  | "permata_va"
  | "credit_card"
  | "other";

export type MidtransTransactionStatus =
  | "capture"      // Kartu kredit sukses
  | "settlement"   // Pembayaran sukses
  | "pending"      // Menunggu pembayaran
  | "deny"         // Ditolak
  | "cancel"       // Dibatalkan
  | "expire"       // Kadaluarsa
  | "failure"      // Gagal
  | "refund"       // Refund
  | "partial_refund" // Refund sebagian
  | "authorize";   // Authorized (kartu kredit)

// Payment document di Firestore
export interface FirestorePayment {
  id: string;
  orderId: string;                    // Foreign key ke orders.orderId
  transactionId: string;              // Midtrans transaction_id (STATIC!)
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  snapToken: string | null;           // Token untuk Snap popup
  paymentUrl: string | null;          // URL untuk redirect/resume payment
  vaNumber: string | null;            // Virtual Account number
  qrString: string | null;            // QR code string untuk QRIS
  grossAmount: number;
  expiresAt: Date;                    // Payment expiration (24 jam)
  createdAt: Date;
  updatedAt: Date;
  
  // Metadata dari Midtrans
  fraudStatus?: string;
  currency?: string;
  midtransStatus?: MidtransTransactionStatus;
}

// Request untuk create payment
export interface CreatePaymentRequest {
  orderId: string;
  totalAmount: number;
  customerDetails: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

// Response dari create payment
export interface CreatePaymentResponse {
  paymentId: string;
  transactionId: string;
  snapToken: string;
  paymentUrl: string;
  expiresAt: string;
}

// Webhook notification dari Midtrans
export interface MidtransNotification {
  transaction_time: string;
  transaction_status: MidtransTransactionStatus;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time?: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency?: string;
  
  // VA specific
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  
  // E-wallet specific
  payment_code?: string;
  
  // QRIS specific
  acquirer?: string;
}
