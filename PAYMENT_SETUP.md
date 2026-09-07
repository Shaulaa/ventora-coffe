# Payment Flow Setup - Ventora Coffee

## 📋 Overview

Payment system telah direfactor untuk menggunakan **persistent payment transactions**. Sekarang user dapat:
- Resume payment yang masih valid tanpa perlu memilih metode pembayaran lagi
- Payment transaction disimpan di database (Firestore `payments` collection)
- Webhook Midtrans sebagai sumber kebenaran untuk payment status

---

## 🏗️ Architecture

### Database Schema

#### **Orders Collection**
```typescript
{
  id: string                     // Firestore doc ID
  orderId: string                // Static order ID (ORD-ABC123)
  userId: string
  items: CartItem[]
  total: number
  status: OrderStatus            // Order status (bukan payment status!)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### **Payments Collection** (NEW!)
```typescript
{
  id: string                     // Firestore doc ID
  orderId: string                // Foreign key ke orders.orderId
  transactionId: string          // Midtrans transaction ID (VENTORA-ORD-ABC123)
  paymentMethod: PaymentMethod   // qris, gopay, bca_va, dll
  paymentStatus: PaymentStatus   // PENDING, PAID, EXPIRED, FAILED
  snapToken: string              // Snap token untuk popup
  paymentUrl: string             // URL untuk resume payment
  vaNumber: string               // Virtual Account number (jika VA)
  qrString: string               // QR code string (jika QRIS)
  grossAmount: number
  expiresAt: timestamp           // 24 jam dari created
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Payment Status Flow

```
CHECKOUT
  ↓
Create Order (status: menunggu_pembayaran)
  ↓
Create Payment (status: PENDING)
  ↓
User memilih metode pembayaran
  ↓
User keluar sebelum bayar
  ↓
Payment masih PENDING di database
  ↓
User klik "Bayar Sekarang"
  ↓
Check: Payment masih valid?
  ├─ YES → Resume existing payment (pakai payment URL)
  └─ NO  → Create new payment transaction
```

---

## 🚀 Setup Instructions

### 1. Environment Variables

Pastikan `.env.local` sudah di-set dengan benar:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false

# App URL (untuk webhook callback)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... (dst)
```

### 2. Midtrans Webhook Setup

#### **Sandbox Environment**

1. Login ke [Midtrans Dashboard Sandbox](https://dashboard.sandbox.midtrans.com/)
2. Go to **Settings** → **Configuration**
3. Set **Payment Notification URL**:
   ```
   https://your-domain.com/api/midtrans/notification
   ```
   
   Untuk development local, gunakan ngrok atau cloudflare tunnel:
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Start ngrok
   ngrok http 3000
   
   # Copy HTTPS URL dan set di Midtrans:
   https://abc123.ngrok.io/api/midtrans/notification
   ```

4. Enable **HTTP Notification** (POST)
5. Save configuration

#### **Production Environment**

1. Login ke [Midtrans Dashboard Production](https://dashboard.midtrans.com/)
2. Same steps as sandbox, tapi gunakan production URL:
   ```
   https://ventora-coffee.com/api/midtrans/notification
   ```

### 3. Test Webhook

#### **Test dengan Midtrans Simulator**

1. Buat test transaction di sandbox
2. Go to **Transactions** di dashboard
3. Pilih transaction yang baru dibuat
4. Click **Send Notification** button
5. Check logs di terminal/console:
   ```
   [Webhook] Received Midtrans notification
   [Webhook] Signature verification: VALID
   [Webhook] Payment status updated: payment123 → PAID
   [Webhook] Order status updated: order123 → sedang_diproses
   ```

#### **Test dengan cURL**

```bash
# Test GET (health check)
curl https://your-domain.com/api/midtrans/notification

# Test POST (simulate notification)
curl -X POST https://your-domain.com/api/midtrans/notification \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "test-123",
    "order_id": "VENTORA-ORD-TEST",
    "transaction_status": "settlement",
    "payment_type": "qris",
    "gross_amount": "50000",
    "status_code": "200",
    "signature_key": "..."
  }'
```

---

## 🧪 Testing Payment Flow

### Scenario 1: Normal Payment Flow
```
1. User checkout dari keranjang
2. Midtrans popup terbuka
3. User pilih metode QRIS
4. User scan QR code
5. Payment berhasil
6. Webhook diterima → payment status = PAID
7. Order status = sedang_diproses
```

### Scenario 2: Resume Payment (User Keluar Sebelum Bayar)
```
1. User checkout dari keranjang
2. Midtrans popup terbuka
3. User pilih metode Virtual Account BCA
4. User close popup (belum transfer)
5. User buka History/Orders
6. Status = BELUM BAYAR
7. User klik "Bayar Sekarang"
8. ✅ Sistem resume existing payment (tidak create baru!)
9. Payment page terbuka dengan VA number yang SAMA
10. User transfer ke VA
11. Webhook diterima → payment status = PAID
```

### Scenario 3: Payment Expired
```
1. User checkout dari keranjang
2. User keluar tanpa bayar
3. 24 jam kemudian...
4. User buka History/Orders
5. Status = BELUM BAYAR (payment expired)
6. User klik "Bayar Sekarang"
7. ✅ Sistem create NEW payment transaction
8. User pilih metode pembayaran dari awal
```

### Scenario 4: Payment Failed → Retry
```
1. User checkout dan pilih kartu kredit
2. Transaksi ditolak bank (insufficient funds)
3. Webhook diterima → payment status = FAILED
4. Order status = dibatalkan
5. User buka History/Orders
6. Status = DIBATALKAN
7. User klik "Bayar Lagi"
8. ✅ Sistem create NEW payment transaction
```

---

## 🔐 Security Checklist

- [x] Server key tidak di-expose ke client
- [x] Webhook signature verification
- [x] Idempotency untuk prevent duplicate processing
- [x] Transaction ID validation
- [x] Payment amount validation
- [x] Order ownership check (user hanya bisa bayar order miliknya)

---

## 📊 Monitoring & Logging

### Key Logs to Monitor

```typescript
// Checkout flow
[Keranjang] Creating new order...
[Keranjang] Order created: abc123
[Keranjang] Creating payment transaction...
[Keranjang] Payment created successfully

// Retry payment
[Pesanan] User clicked Bayar Sekarang for order: ORD-001
[Pesanan] Found existing payment, resuming: payment123
[Pesanan] Payment status: PENDING

// Webhook
[Webhook] Received Midtrans notification
[Webhook] Signature verification: VALID
[Webhook] Payment status updated: payment123 → PAID
[Webhook] Order status updated: order123 → sedang_diproses
```

### Common Issues

#### **Issue: Payment tidak update setelah bayar**
**Cause:** Webhook tidak configured dengan benar
**Solution:** 
1. Check webhook URL di Midtrans dashboard
2. Test dengan "Send Notification" button
3. Check server logs untuk errors

#### **Issue: User harus pilih metode pembayaran lagi**
**Cause:** Payment tidak di-resume, malah create baru
**Solution:**
1. Check apakah payment record ada di database
2. Check `getActivePayment()` function
3. Check console logs untuk errors

#### **Issue: Signature verification failed**
**Cause:** Server key tidak match
**Solution:**
1. Check `MIDTRANS_SERVER_KEY` di `.env.local`
2. Pastikan menggunakan server key yang benar (sandbox vs production)

---

## 🛠️ Development Tips

### Test Midtrans Payment Methods

Midtrans Sandbox memiliki test credentials:

#### **QRIS**
- Scan dengan app Midtrans Simulator
- Auto-success setelah scan

#### **GoPay**
- Phone: 08123456789
- OTP: 123456

#### **Virtual Account**
- BCA VA: Transfer amount yang sama dengan order
- Auto-success di simulator

#### **Credit Card**
- Card Number: 4811 1111 1111 1114
- CVV: 123
- Expiry: 01/25
- OTP: 112233

### Local Development with ngrok

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Set ngrok HTTPS URL di Midtrans dashboard
# Example: https://abc123.ngrok.io/api/midtrans/notification
```

---

## 📚 References

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans Snap](https://docs.midtrans.com/en/snap/overview)
- [Midtrans HTTP Notification](https://docs.midtrans.com/en/after-payment/http-notification)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)

---

## ✅ Checklist sebelum Production

- [ ] Set `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true`
- [ ] Gunakan production Midtrans keys
- [ ] Set production webhook URL di Midtrans dashboard
- [ ] Test semua payment methods di production
- [ ] Monitor webhook logs selama 24 jam pertama
- [ ] Setup error alerting (Sentry, etc.)
- [ ] Backup database secara regular
- [ ] Test payment expiration flow (24 jam)
- [ ] Test concurrent payment scenarios
- [ ] Verify signature validation works di production

---

## 🎉 Summary

Payment flow sekarang:
- ✅ Persistent payment transactions
- ✅ Resume payment tanpa create transaction baru
- ✅ Webhook sebagai source of truth
- ✅ Idempotent notification handling
- ✅ Proper separation of Order dan Payment
- ✅ Secure signature verification
- ✅ 24-hour payment expiration
- ✅ Support retry payment untuk expired/failed transactions

Selamat! Payment system kamu sekarang modern dan reliable! 🚀
