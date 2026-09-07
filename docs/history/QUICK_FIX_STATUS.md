# Quick Fix: Update Payment Status 🔧

## Issue: Payment Berhasil tapi Status Masih "Menunggu Pembayaran"

Ini terjadi karena webhook Midtrans belum ter-configure atau belum reaching server.

---

## 🚀 **Quick Fixes** (Pilih salah satu)

### **Method 1: Manual Update via API** (Tercepat!)

```bash
# Update status untuk order tertentu
curl "http://localhost:3000/api/manual-update-status?orderId=ORD-001&orderStatus=sedang_diproses&paymentStatus=PAID"

# Ganti ORD-001 dengan order ID yang sebenarnya
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "orderId": "ORD-001",
  "orderStatus": "sedang_diproses",
  "paymentStatus": "PAID"
}
```

---

### **Method 2: Trigger Webhook dari Midtrans**

```bash
# 1. Login ke Midtrans Dashboard
https://dashboard.sandbox.midtrans.com/

# 2. Go to Transactions

# 3. Find your transaction (search by order ID)

# 4. Click "Send Notification" button

# 5. Wait 2-3 seconds → Status akan update otomatis
```

---

### **Method 3: Test Webhook Locally**

```bash
# Get transaction ID dari order (misal: VENTORA-ORD-001-ABC123)

# Test webhook:
curl "http://localhost:3000/api/test-webhook?orderId=VENTORA-ORD-001-ABC123&status=settlement&amount=155000"

# Check response dan logs
```

---

### **Method 4: Manual Update via Firebase Console**

```bash
# 1. Go to Firebase Console
https://console.firebase.google.com/

# 2. Select project: ventora-coffe

# 3. Firestore Database

# 4. Update Order:
#    - Collection: orders
#    - Find document dengan orderId = "ORD-001"
#    - Update field: status = "sedang_diproses"

# 5. Update Payment:
#    - Collection: payments
#    - Find document dengan orderId = "ORD-001"
#    - Update field: paymentStatus = "PAID"
```

---

## 📋 **Status Mapping Reference**

### **Order Status:**
```
menunggu_pembayaran  → User belum bayar / pending
sedang_diproses      → User sudah bayar, order diproses
siap                 → Order siap pickup
selesai              → Order completed
dibatalkan           → Cancelled/failed
```

### **Payment Status:**
```
PENDING    → Menunggu pembayaran
PAID       → Sudah dibayar (settlement/capture)
EXPIRED    → Kadaluarsa (24 jam lewat)
FAILED     → Gagal (deny/cancel)
CANCELLED  → Dibatalkan
```

---

## 🎯 **For Your Specific Case**

Berdasarkan screenshot, order Anda:
- Order ID: `#Z9WJB3W1` (atau `ORD-xxx` di backend)
- Total: `Rp 155.000`
- Status: `Menunggu Pembayaran` ❌
- Seharusnya: `Sedang Diproses` ✅

### **Quick Fix Command:**

```bash
# 1. Cari order ID di Firebase Console atau logs
# Misal order ID = "ORD-001"

# 2. Run manual update:
curl "http://localhost:3000/api/manual-update-status?orderId=ORD-001&orderStatus=sedang_diproses&paymentStatus=PAID"

# 3. Refresh page di browser

# 4. Status should update!
```

---

## 🔍 **How to Find Order ID**

### **Method 1: From Browser Console**
```javascript
// Open DevTools (F12)
// Go to Console
// Run:
console.log("Order ID:", document.querySelector('[data-order-id]')?.dataset.orderId);
```

### **Method 2: From Firebase**
```bash
# 1. Firebase Console → Firestore
# 2. Collection: orders
# 3. Find document dengan:
#    - total: 155000
#    - createdAt: 2 Sep 2026 13:53
# 4. Look at field: orderId (e.g., "ORD-L9X8K2")
```

### **Method 3: From Midtrans**
```bash
# 1. Midtrans Dashboard → Transactions
# 2. Find transaction dengan amount: 155000
# 3. Look at order_id (e.g., "VENTORA-ORD-L9X8K2-ABC123")
# 4. Extract order ID: "ORD-L9X8K2"
```

---

## ✅ **Verification**

After running fix, verify:

1. **Refresh Browser**
   ```bash
   # Reload /pesanan page
   # Status should show: "Sedang Diproses" atau "Siap"
   ```

2. **Check Firebase**
   ```bash
   # orders collection
   # → status field should be: "sedang_diproses"
   
   # payments collection
   # → paymentStatus field should be: "PAID"
   ```

3. **Check Logs**
   ```bash
   [Manual Update] ✅ Order status updated
   [Manual Update] ✅ Payment status updated
   ```

---

## 🚨 **Permanent Solution**

Untuk prevent issue ini di future:

### **1. Setup Webhook URL di Midtrans**
```bash
# Production:
1. Login: https://dashboard.midtrans.com/
2. Settings → Configuration
3. Payment Notification URL:
   https://ventora-coffee.com/api/midtrans/notification
4. Save

# For local development:
1. Run: npx ngrok http 3000
2. Copy HTTPS URL: https://abc123.ngrok.io
3. Set in Midtrans:
   https://abc123.ngrok.io/api/midtrans/notification
```

### **2. Test Webhook**
```bash
curl http://localhost:3000/api/test-webhook?orderId=TEST-001&status=settlement

# Should see:
[Webhook] ✅ Signature valid
[Webhook] ✅ Payment status updated
[Webhook] ✅ Order status updated
[Webhook] 🎉 SUCCESS!
```

### **3. Monitor Logs**
```bash
# Watch for webhook notifications:
tail -f logs.txt | grep "\[Webhook\]"

# Every payment should trigger webhook
```

---

## 📚 **Related Documentation**

- **WEBHOOK_TESTING.md** - Complete webhook testing guide
- **PAYMENT_DEBUG.md** - Troubleshooting payment issues
- **PAYMENT_SETUP.md** - Full payment system architecture

---

## 💡 **Pro Tips**

1. **Always check webhook logs first**
   ```bash
   grep "\[Webhook\]" logs.txt
   # If no logs = webhook not configured!
   ```

2. **Use test endpoint untuk development**
   ```bash
   curl http://localhost:3000/api/test-webhook?orderId=YOUR-ORDER-ID&status=settlement
   ```

3. **Setup notification alerts**
   ```javascript
   // When payment success, show notification:
   if (paymentStatus === "PAID") {
     alert("✅ Pembayaran berhasil!");
   }
   ```

---

## 🎉 **Quick Summary**

**Fastest Fix:**
```bash
# 1. Find order ID (e.g., ORD-001)
# 2. Run:
curl "http://localhost:3000/api/manual-update-status?orderId=ORD-001&orderStatus=sedang_diproses&paymentStatus=PAID"
# 3. Refresh page
# 4. Done! ✅
```

**Permanent Fix:**
```bash
# Setup webhook URL di Midtrans Dashboard
# → Future payments akan auto-update
```

---

**Created:** September 2, 2026  
**Status:** Ready to use! 🚀
