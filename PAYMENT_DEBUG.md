# Payment System Debug Guide 🔍

Quick reference untuk debugging payment issues.

---

## 🎯 Quick Diagnosis

### **User: "Harus pilih metode pembayaran lagi!"**

```bash
# Check 1: Apakah payment record ada?
# → Open Firebase Console → Firestore → payments collection
# → Search by orderId

# Check 2: Check console logs
[Pesanan] Found existing payment, resuming: payment123  ✅ GOOD
[Pesanan] No active payment found                       ❌ ISSUE!

# Check 3: Check payment status
paymentStatus: "PENDING"   ✅ GOOD
paymentStatus: "EXPIRED"   ❌ Payment expired, create new
paymentStatus: "PAID"      ❌ Already paid, shouldn't retry

# Fix:
# - If payment not found → normal, will create new
# - If payment expired → normal, will create new
# - If payment PENDING but not resuming → check paymentUrl field
```

---

### **User: "Sudah bayar tapi order tidak update!"**

```bash
# Check 1: Webhook configured?
# → Midtrans Dashboard → Settings → Configuration
# → Payment Notification URL: https://your-domain.com/api/midtrans/notification ✅

# Check 2: Webhook received?
# → Check server logs:
[Webhook] Received Midtrans notification  ✅ GOOD
# → If not found → webhook URL salah atau blocked

# Check 3: Signature valid?
[Webhook] Signature verification: VALID   ✅ GOOD
[Webhook] Signature verification: INVALID ❌ Wrong server key!

# Check 4: Payment updated?
[Webhook] Payment status updated: payment123 → PAID  ✅ GOOD
[Webhook] Order status updated: order123 → sedang_diproses  ✅ GOOD

# Fix:
# - Webhook not received → check URL, firewall, ngrok
# - Signature invalid → check MIDTRANS_SERVER_KEY
# - Payment not updated → check database permissions
```

---

### **User: "Payment expired!"**

```bash
# Check 1: When was payment created?
payment.createdAt: 2026-09-01 10:00
payment.expiresAt: 2026-09-02 10:00  (24h later)

# Check 2: Current time
now: 2026-09-02 11:00  ❌ Expired! (1h over)

# Solution: Normal behavior!
# → User should see "Bayar Lagi" button
# → System will create NEW payment when clicked
```

---

## 📊 Database Queries

### **Find order by Order ID**
```javascript
// Firebase Console → Firestore
// orders collection → where("orderId", "==", "ORD-001")
```

### **Find payment by Order ID**
```javascript
// payments collection → where("orderId", "==", "ORD-001")
```

### **Find all pending payments**
```javascript
// payments collection → where("paymentStatus", "==", "PENDING")
```

### **Find expired payments**
```javascript
// payments collection 
// → where("paymentStatus", "==", "PENDING")
// → where("expiresAt", "<", new Date())
```

---

## 🧪 Test Commands

### **Test Webhook Endpoint**
```bash
# Health check
curl https://your-domain.com/api/midtrans/notification

# Expected response:
{
  "message": "Midtrans Webhook Endpoint",
  "status": "active",
  "note": "This endpoint receives POST notifications from Midtrans"
}
```

### **Test Midtrans API**
```bash
# Test create transaction
curl -X POST https://your-domain.com/api/midtrans \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-TEST-001",
    "totalAmount": 50000,
    "customerDetails": {
      "firstName": "Test",
      "email": "test@example.com",
      "phone": "081234567890"
    },
    "itemDetails": [{
      "id": "product-1",
      "name": "Test Product",
      "price": 50000,
      "quantity": 1
    }]
  }'

# Expected response:
{
  "token": "abc123...",
  "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/...",
  "transactionId": "VENTORA-ORD-TEST-001"
}
```

### **Simulate Webhook (Local Testing)**
```bash
# Test webhook locally
curl -X POST http://localhost:3000/api/midtrans/notification \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "test-tx-123",
    "order_id": "VENTORA-ORD-001",
    "transaction_status": "settlement",
    "payment_type": "qris",
    "gross_amount": "50000",
    "status_code": "200",
    "signature_key": "INVALID-FOR-TEST"
  }'

# Note: Will fail signature verification (expected for testing)
```

---

## 📝 Log Interpretation

### **Checkout Flow Logs**

```typescript
// ✅ GOOD - Normal checkout
[Keranjang] Creating new order...
[Keranjang] Order created: abc123
[Keranjang] Creating payment transaction...
[Snap] Creating new payment transaction
[Snap] Order ID: ORD-001
[Midtrans API] Creating transaction with params
[Midtrans API] Response status: 201
[Keranjang] Payment created successfully, redirecting...

// ❌ BAD - Error creating order
[Keranjang] Creating new order...
[Keranjang] Error: Error creating order
// → Check Firebase permissions

// ❌ BAD - Error creating payment
[Keranjang] Creating payment transaction...
[Snap] Error creating payment: ...
// → Check Midtrans credentials
```

### **Resume Payment Logs**

```typescript
// ✅ GOOD - Resume existing payment
[Pesanan] User clicked Bayar Sekarang for order: ORD-001
[Pesanan] Found existing payment, resuming: payment123
[Pesanan] Payment status: PENDING
[Pesanan] Expires at: 2026-09-02T10:00:00Z
[Snap] Resuming existing payment

// ✅ GOOD - Create new payment (expired)
[Pesanan] User clicked Bayar Sekarang for order: ORD-001
[Pesanan] No active payment found, creating new payment
[Pesanan] Creating NEW payment for order: ORD-001
[Snap] Creating new payment transaction

// ❌ BAD - Payment URL missing
[Pesanan] Found existing payment, resuming: payment123
[Pesanan] Error: Payment URL not found
// → Check payment record, paymentUrl field should exist
```

### **Webhook Logs**

```typescript
// ✅ GOOD - Successful webhook
[Webhook] Received Midtrans notification
[Webhook] Notification data: {transaction_id: ..., order_id: VENTORA-ORD-001, ...}
[Webhook] Signature verification: VALID
[Webhook] Found payment: payment123 for order: ORD-001
[Webhook] Payment status updated: payment123 → PAID
[Webhook] Order status updated: order123 → sedang_diproses

// ✅ GOOD - Idempotent (duplicate notification)
[Webhook] Received Midtrans notification
[Webhook] Signature verification: VALID
[Webhook] Found payment: payment123 for order: ORD-001
[Webhook] Payment already PAID, skipping update (idempotency)

// ❌ BAD - Invalid signature
[Webhook] Received Midtrans notification
[Webhook] Signature verification: INVALID
// → Check MIDTRANS_SERVER_KEY

// ❌ BAD - Payment not found
[Webhook] Received Midtrans notification
[Webhook] Signature verification: VALID
[Webhook] Payment not found for transaction: VENTORA-ORD-001
// → Payment record missing in database
```

---

## 🔍 Common Issues & Fixes

### **Issue 1: Payment record tidak dibuat**

**Symptoms:**
```typescript
[Keranjang] Creating payment transaction...
[Keranjang] Payment created successfully
// But no payment record in Firestore
```

**Cause:** `createPayment()` not called atau error

**Fix:**
```typescript
// Check keranjang/page.tsx
await createPayment({
  orderId: uniqueOrderId,
  grossAmount: totalPrice,
  snapToken: paymentData.token,
  paymentUrl: paymentData.redirectUrl,
  expiresInHours: 24,
});
```

---

### **Issue 2: Transaction ID tidak match**

**Symptoms:**
```typescript
[Webhook] Payment not found for transaction: VENTORA-ORD-001-EXTRA
```

**Cause:** Transaction ID generation inconsistent

**Fix:**
```typescript
// Check payment.ts
export function generateTransactionId(orderId: string): string {
  return `VENTORA-${orderId}`; // Should be exactly this format
}

// Order ID: ORD-001
// Transaction ID: VENTORA-ORD-001  ✅
// NOT: VENTORA-ORD-001-123456  ❌
```

---

### **Issue 3: Race condition (multiple payments)**

**Symptoms:**
- User clicks "Bayar" multiple times quickly
- Multiple payment records created

**Fix:**
```typescript
// Already implemented in pesanan page
const [isProcessing, setIsProcessing] = useState<string | null>(null);

async function handleBayarSekarang(order: FirestoreOrder) {
  if (!user || !order.orderId) return;
  setIsProcessing(order.id); // ← Prevent double-click
  
  try {
    // ... payment logic
  } finally {
    setIsProcessing(null);
  }
}

// Button disabled during processing
<button disabled={isProcessing === order.id} ...>
```

---

### **Issue 4: Signature verification failed**

**Cause:** Wrong server key atau environment mismatch

**Debug:**
```typescript
// Add to notification/route.ts
console.log("Expected signature:", hash);
console.log("Received signature:", signature_key);
console.log("Match:", hash === signature_key);

// Check values:
console.log("Order ID:", order_id);
console.log("Status Code:", status_code);
console.log("Gross Amount:", gross_amount);
console.log("Server Key (first 10):", serverKey?.substring(0, 10));
```

**Fix:**
- Verify `MIDTRANS_SERVER_KEY` in `.env.local`
- Check environment (sandbox vs production)
- Ensure no extra spaces in env variable

---

## 🛠️ Development Tools

### **Firebase Console Shortcuts**

```
Orders: https://console.firebase.google.com/project/YOUR-PROJECT/firestore/data/~2Forders
Payments: https://console.firebase.google.com/project/YOUR-PROJECT/firestore/data/~2Fpayments
```

### **Midtrans Dashboard**

```
Sandbox: https://dashboard.sandbox.midtrans.com/
Production: https://dashboard.midtrans.com/

Transactions: /transactions
Settings: /settings/snap_preferences
Notifications: /settings/configuration
```

### **Local Development**

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: ngrok (for webhook testing)
ngrok http 3000

# Terminal 3: Logs monitoring
npm run dev | grep -E "\[Webhook\]|\[Payment\]|\[Pesanan\]"
```

---

## 📞 Emergency Contacts

**Critical Issues (Production Down):**
1. Disable webhook: Midtrans Dashboard → Clear notification URL
2. Rollback deployment: Vercel Dashboard → Redeploy previous version
3. Check status page: Check if Midtrans having issues

**Non-Critical Issues:**
1. Check this debug guide first
2. Search GitHub issues
3. Ask in team chat
4. Create GitHub issue with logs

---

## 🎓 Quick Reference

### **Payment Status Flow**
```
PENDING → User belum bayar
PAID → User sudah bayar (settlement/capture)
EXPIRED → 24 jam lewat tanpa bayar
FAILED → Transaksi ditolak (deny/cancel)
CANCELLED → User/admin cancel
```

### **Order Status Flow**
```
menunggu_pembayaran → Waiting for payment
sedang_diproses → Payment success, making order
siap → Order ready for pickup
selesai → Order completed
dibatalkan → Payment failed/expired
```

### **Midtrans Transaction Status**
```
settlement → Sukses (for VA, QRIS, e-wallet)
capture → Sukses (for credit card)
pending → Menunggu payment
deny → Ditolak
expire → Kadaluarsa
cancel → Dibatalkan
failure → Gagal
```

---

**Last Updated:** September 2, 2026  
**Keep this document handy for debugging!** 🔧
