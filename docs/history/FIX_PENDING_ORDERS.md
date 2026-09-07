# Emergency Fix: Update Pending Orders 🚨

## Quick Fix untuk Order yang Statusnya Masih "Menunggu Pembayaran"

---

## 🎯 **Step-by-Step Fix**

### **Step 1: Cek Order Details**

```bash
# Cari order berdasarkan amount (Rp 155.000 = 155000)
curl "http://localhost:3000/api/debug-order?amount=155000"

# Atau cari latest 5 orders:
curl "http://localhost:3000/api/debug-order"
```

**Response akan berisi:**
```json
{
  "ordersFound": 1,
  "orders": [{
    "firestoreId": "abc123...",
    "orderId": "ORD-L9X8K2",
    "total": 155000,
    "status": "menunggu_pembayaran",
    ...
  }],
  "payments": [{
    "transactionId": "VENTORA-ORD-L9X8K2-ABC123",
    "paymentStatus": "PENDING",
    ...
  }],
  "instructions": {
    "updateStatus": "/api/manual-update-status?orderId=ORD-L9X8K2&..."
  }
}
```

### **Step 2: Copy Update Command**

Dari response di atas, copy command di `instructions.updateStatus`:

```bash
curl "http://localhost:3000/api/manual-update-status?orderId=ORD-L9X8K2&orderStatus=sedang_diproses&paymentStatus=PAID"
```

### **Step 3: Execute Fix**

Paste command dan run:

```bash
# Expected response:
{
  "success": true,
  "message": "Status updated successfully"
}
```

### **Step 4: Verify**

```bash
# 1. Refresh browser di /pesanan
# 2. Status harus berubah dari "Menunggu Pembayaran" → "Sedang Diproses"
```

---

## 💻 **Alternative: Browser Console Method**

Jika curl tidak available:

### **Step 1: Open Browser Console**

```
1. Go to: http://localhost:3000/pesanan
2. Press F12 (open DevTools)
3. Go to Console tab
```

### **Step 2: Run Debug**

```javascript
// Cari order dengan amount 155000
fetch('/api/debug-order?amount=155000')
  .then(r => r.json())
  .then(data => {
    console.log('Orders found:', data.orders);
    console.log('Fix command:', data.instructions.updateStatus);
    
    // Save to clipboard
    if (data.orders.length > 0) {
      const orderId = data.orders[0].orderId;
      const fixUrl = `/api/manual-update-status?orderId=${orderId}&orderStatus=sedang_diproses&paymentStatus=PAID`;
      console.log('Run this:', fixUrl);
      
      // Auto-execute fix (uncomment jika mau langsung fix):
      // return fetch(fixUrl);
    }
  });
```

### **Step 3: Execute Fix**

```javascript
// Copy order ID dari step sebelumnya, ganti ORD-XXX:
fetch('/api/manual-update-status?orderId=ORD-XXX&orderStatus=sedang_diproses&paymentStatus=PAID')
  .then(r => r.json())
  .then(result => {
    console.log('Fix result:', result);
    if (result.success) {
      alert('✅ Status updated! Refresh page.');
      location.reload();
    }
  });
```

---

## 🔧 **Method 3: Firebase Console (Manual)**

### **Step 1: Find Order**

```
1. Go to: https://console.firebase.google.com/
2. Project: ventora-coffe
3. Firestore Database
4. Collection: orders
5. Filter: total == 155000
```

### **Step 2: Update Order Status**

```
1. Click on the document
2. Find field: "status"
3. Current value: "menunggu_pembayaran"
4. Change to: "sedang_diproses"
5. Click Update
```

### **Step 3: Update Payment Status**

```
1. Collection: payments
2. Filter: orderId == "ORD-XXX" (dari order di step 1)
3. Click on the document
4. Find field: "paymentStatus"
5. Current value: "PENDING"
6. Change to: "PAID"
7. Click Update
```

### **Step 4: Verify**

```
Refresh browser di /pesanan → Status updated! ✅
```

---

## 📋 **Batch Fix: Update Multiple Orders**

Jika ada banyak orders yang stuck:

### **Method 1: Via API**

```bash
# Get all orders dengan total 155000
curl "http://localhost:3000/api/debug-order?amount=155000"

# For each order, run:
curl "http://localhost:3000/api/manual-update-status?orderId=ORD-001&orderStatus=sedang_diproses&paymentStatus=PAID"
curl "http://localhost:3000/api/manual-update-status?orderId=ORD-002&orderStatus=sedang_diproses&paymentStatus=PAID"
# ... dst
```

### **Method 2: Browser Console (Auto)**

```javascript
// Auto-fix all pending orders dengan amount 155000
async function fixAllPendingOrders() {
  const response = await fetch('/api/debug-order?amount=155000');
  const data = await response.json();
  
  console.log(`Found ${data.orders.length} orders to fix`);
  
  for (const order of data.orders) {
    if (order.status === 'menunggu_pembayaran') {
      console.log(`Fixing order ${order.orderId}...`);
      
      const fixUrl = `/api/manual-update-status?orderId=${order.orderId}&orderStatus=sedang_diproses&paymentStatus=PAID`;
      const result = await fetch(fixUrl).then(r => r.json());
      
      console.log(`✅ ${order.orderId}:`, result.message);
    }
  }
  
  alert('All orders fixed! Refresh page.');
  location.reload();
}

// Run:
fixAllPendingOrders();
```

---

## ⚠️ **Important Notes**

### **Status Mapping:**

```javascript
// Order Status:
"menunggu_pembayaran" → Payment pending
"sedang_diproses"     → Payment success, order being processed ✅
"siap"                → Ready for pickup
"selesai"             → Completed
"dibatalkan"          → Cancelled

// Payment Status:
"PENDING"   → Waiting for payment
"PAID"      → Payment successful ✅
"EXPIRED"   → Payment expired (24h)
"FAILED"    → Payment failed
"CANCELLED" → Payment cancelled
```

### **When to Use Each Method:**

```
curl command:
✅ Fast & scriptable
✅ Good for developers
❌ Requires terminal access

Browser console:
✅ No additional tools needed
✅ Can auto-fix multiple orders
❌ Need to open DevTools

Firebase Console:
✅ Visual interface
✅ See all data
❌ Slow for multiple orders
❌ Manual process
```

---

## 🎯 **For Your Specific Case**

Based on screenshot (`#Z9WJB3W1`, `Rp 155.000`):

### **Quick Fix (Copy-Paste):**

```bash
# 1. Debug to get exact order ID:
curl "http://localhost:3000/api/debug-order?amount=155000"

# 2. Copy order ID from response (e.g., ORD-L9X8K2)

# 3. Run fix (replace ORD-XXX):
curl "http://localhost:3000/api/manual-update-status?orderId=ORD-XXX&orderStatus=sedang_diproses&paymentStatus=PAID"

# 4. Refresh page /pesanan

# 5. Done! ✅
```

---

## 🚀 **Prevent Future Issues**

### **Setup Webhook (Permanent Solution):**

```bash
# 1. For local development:
npx ngrok http 3000
# Copy HTTPS URL: https://abc123.ngrok.io

# 2. Midtrans Dashboard:
https://dashboard.sandbox.midtrans.com/
→ Settings → Configuration
→ Payment Notification URL: https://abc123.ngrok.io/api/midtrans/notification
→ Save

# 3. Test webhook:
curl "http://localhost:3000/api/test-webhook?orderId=VENTORA-ORD-001&status=settlement&amount=50000"

# 4. Check logs:
[Webhook] ✅ Payment status updated
[Webhook] ✅ Order status updated
```

---

## ✅ **Checklist**

After fix:

- [ ] Run debug-order API
- [ ] Get order ID
- [ ] Run manual-update-status
- [ ] Refresh /pesanan page
- [ ] Verify status: "Sedang Diproses" ✅
- [ ] Verify in Firebase Console
- [ ] (Optional) Setup webhook for future

---

## 📞 **Still Not Working?**

If status still not updating:

1. **Check browser console for errors**
   ```javascript
   // F12 → Console
   // Look for red errors
   ```

2. **Check Firebase permissions**
   ```
   Firestore Rules → Make sure update allowed
   ```

3. **Clear cache**
   ```
   Ctrl+Shift+R (hard refresh)
   ```

4. **Check server logs**
   ```bash
   # Look for [PaymentFinish] or [Manual Update] logs
   ```

---

**Created:** September 2, 2026  
**Status:** Emergency fix ready! 🚨
