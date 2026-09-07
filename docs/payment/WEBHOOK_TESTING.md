# Webhook Testing Guide 🧪

## Issue: Payment Berhasil tapi Status Masih "Menunggu Pembayaran"

### **Root Cause:**
Webhook dari Midtrans tidak ter-configure atau tidak reaching your server.

---

## 🔍 **Diagnosis Steps**

### **Step 1: Check Webhook URL Configuration**

1. Login ke Midtrans Dashboard
   - Sandbox: https://dashboard.sandbox.midtrans.com/
   - Production: https://dashboard.midtrans.com/

2. Go to: **Settings** → **Configuration**

3. Check **Payment Notification URL**:
   ```
   ✅ Should be: https://your-domain.com/api/midtrans/notification
   ❌ If empty: Webhook not configured!
   ```

---

### **Step 2: Test Webhook Endpoint**

```bash
# Test if endpoint is accessible
curl https://your-domain.com/api/midtrans/notification

# Expected response:
{
  "message": "Midtrans Webhook Endpoint",
  "status": "active",
  "note": "This endpoint receives POST notifications from Midtrans"
}
```

---

### **Step 3: Check Server Logs**

After payment, check your server logs untuk:

```bash
# ✅ GOOD - Webhook received:
[Webhook] ============================================
[Webhook] Received Midtrans notification at: 2026-09-02...
[Webhook] 📦 Notification data: {...}
[Webhook] ✅ Signature valid
[Webhook] ✅ Found payment: {...}
[Webhook] ✅ Payment status updated
[Webhook] ✅ Order status updated
[Webhook] 🎉 SUCCESS!

# ❌ BAD - No webhook logs:
(silence... webhook tidak diterima!)
```

---

## 🧪 **Testing Methods**

### **Method 1: Test via Midtrans Dashboard** (Recommended)

1. Create test transaction di sandbox
2. Go to **Transactions** tab
3. Find your transaction
4. Click **"Send Notification"** button
5. Check server logs

---

### **Method 2: Test with curl**

```bash
# Generate test signature first
# You need: order_id, status_code, gross_amount, server_key

# Example:
ORDER_ID="VENTORA-ORD-001-ABC123"
STATUS_CODE="200"
GROSS_AMOUNT="50000"
SERVER_KEY="your-server-key"

# Generate signature (Linux/Mac):
echo -n "${ORDER_ID}${STATUS_CODE}${GROSS_AMOUNT}${SERVER_KEY}" | sha512sum

# Send test notification:
curl -X POST https://your-domain.com/api/midtrans/notification \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_time": "2026-09-02 12:00:00",
    "transaction_status": "settlement",
    "transaction_id": "test-tx-123",
    "status_message": "Success",
    "status_code": "200",
    "signature_key": "YOUR_GENERATED_SIGNATURE",
    "payment_type": "qris",
    "order_id": "VENTORA-ORD-001-ABC123",
    "merchant_id": "test",
    "gross_amount": "50000",
    "fraud_status": "accept",
    "currency": "IDR"
  }'
```

---

### **Method 3: Use Test Webhook Endpoint** (Easiest!)

We created a test endpoint untuk simulate webhook:

```bash
# Test dengan default values
curl http://localhost:3000/api/test-webhook?orderId=VENTORA-ORD-001-ABC123&status=settlement&amount=50000

# Or POST with custom data
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "VENTORA-ORD-001-ABC123",
    "transaction_status": "settlement",
    "gross_amount": "50000"
  }'
```

**This will:**
1. Generate proper signature
2. Create mock notification
3. Send to real webhook endpoint
4. Return webhook response

---

## 🔧 **Common Issues & Solutions**

### **Issue 1: Webhook URL Not Set**

**Symptoms:**
- Payment berhasil
- Order status tidak update
- No webhook logs

**Solution:**
```bash
1. Login Midtrans Dashboard
2. Settings → Configuration
3. Set Payment Notification URL:
   https://your-domain.com/api/midtrans/notification
4. Save
```

---

### **Issue 2: Signature Verification Failed**

**Symptoms:**
```
[Webhook] ❌ Invalid signature!
```

**Check:**
1. Server key correct?
2. Environment (sandbox vs production) match?
3. Gross amount format correct? (integer, no decimals)

**Debug:**
```typescript
// In webhook logs, you'll see:
[Webhook] Expected hash calculation:
[Webhook] Input: VENTORA-ORD-001-ABC123200500...

// Compare with Midtrans signature_key
```

---

### **Issue 3: Payment Not Found**

**Symptoms:**
```
[Webhook] ❌ Payment not found for transaction: VENTORA-ORD-001-ABC123
```

**Causes:**
1. Payment record not created in database
2. Transaction ID mismatch
3. Database query issue

**Check:**
```bash
# Check Firestore:
# Collection: payments
# Query: where("transactionId", "==", "VENTORA-ORD-001-ABC123")

# Should return 1 document
```

**Debug:**
```bash
# Check logs saat checkout:
[Keranjang] Creating payment transaction...
[Keranjang] Payment created successfully

# If missing, payment record tidak dibuat!
```

---

### **Issue 4: Order Not Found**

**Symptoms:**
```
[Webhook] ❌ Order not found: ORD-001
```

**Causes:**
1. Order record not created
2. orderId field mismatch
3. Database query issue

**Check:**
```bash
# Check Firestore:
# Collection: orders
# Query: where("orderId", "==", "ORD-001")

# Should return 1 document
```

---

### **Issue 5: Webhook Cannot Reach Server**

**Symptoms:**
- No webhook logs at all
- Midtrans says "sent" but nothing received

**Causes:**
1. Server firewall blocking Midtrans IPs
2. SSL certificate issue
3. Server down/unreachable
4. Wrong URL

**Test:**
```bash
# From external server (not localhost):
curl https://your-domain.com/api/midtrans/notification

# Should return 200 OK
```

**For localhost development:**
```bash
# Use ngrok:
ngrok http 3000

# Set ngrok HTTPS URL di Midtrans:
https://abc123.ngrok.io/api/midtrans/notification
```

---

## ✅ **Verification Checklist**

After setup, verify:

- [ ] Webhook URL set di Midtrans Dashboard
- [ ] Webhook endpoint accessible (curl test)
- [ ] Server key correct in .env
- [ ] Test transaction created
- [ ] "Send Notification" clicked
- [ ] Webhook logs appear
- [ ] Signature valid
- [ ] Payment status updated
- [ ] Order status updated
- [ ] User sees updated status

---

## 🎯 **Quick Fix Flow**

```
1. Set Webhook URL di Midtrans
   ↓
2. Test endpoint dengan curl
   ↓
3. Create test transaction
   ↓
4. Click "Send Notification"
   ↓
5. Check logs
   ↓
6. If success:
   ✅ Payment status = PAID
   ✅ Order status = sedang_diproses
   ✅ User sees update
   
7. If failed:
   → Check logs untuk error
   → Fix issue
   → Retry from step 3
```

---

## 📊 **Webhook Status Check**

Create this simple page to monitor webhook health:

```typescript
// src/app/admin/webhook-status/page.tsx

"use client";

export default function WebhookStatus() {
  async function testWebhook() {
    const res = await fetch("/api/test-webhook?orderId=TEST-001&status=settlement&amount=50000");
    const data = await res.json();
    console.log("Test result:", data);
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Webhook Status</h1>
      
      <button
        onClick={testWebhook}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Webhook
      </button>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>Check console logs for results</p>
      </div>
    </div>
  );
}
```

---

## 🚀 **Production Checklist**

Before going live:

- [ ] Webhook URL set (production URL)
- [ ] Using production Midtrans keys
- [ ] SSL certificate valid
- [ ] Server accessible from internet
- [ ] Test with real payment
- [ ] Verify status updates
- [ ] Monitor logs for 24 hours
- [ ] Setup error alerting

---

## 📞 **Need Help?**

**Check logs first:**
```bash
# Look for webhook logs
grep "\[Webhook\]" logs.txt

# Common patterns:
[Webhook] Received...          # Webhook reached server ✅
[Webhook] Invalid signature    # Server key issue ❌
[Webhook] Payment not found    # Database issue ❌
[Webhook] Order not found      # Database issue ❌
[Webhook] SUCCESS!             # Everything works! ✅
```

**Still stuck?**
1. Check PAYMENT_DEBUG.md
2. Review webhook logs
3. Test with test-webhook endpoint
4. Verify Midtrans dashboard configuration

---

**Last Updated:** September 2, 2026  
**Status:** Ready for testing! 🧪
