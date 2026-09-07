# Payment System Migration Guide

## 🎯 Overview

Panduan ini membantu Anda melakukan migration dari payment system lama ke yang baru dengan **zero downtime** dan **backward compatibility**.

---

## ⚠️ Breaking Changes

### **Database Schema**
- **Added:** `payments` collection (new!)
- **Modified:** `orders` collection masih ada, tidak ada breaking changes
- **Deprecated:** `localStorage` tracking untuk transaction ID

### **API Changes**
- **Added:** `/api/midtrans/notification` - Webhook endpoint (NEW!)
- **Modified:** `/api/midtrans` - Sekarang return `transactionId`
- **Deprecated:** `/api/midtrans/continue` - Tidak digunakan lagi

---

## 📋 Migration Steps

### **Step 1: Backup Database** ⏱️ 5 minutes

```bash
# Backup Firestore orders collection
# Via Firebase Console:
# 1. Go to Firestore Database
# 2. Click "Import/Export"
# 3. Export "orders" collection
# 4. Save backup file locally
```

**Why:** Safety first! Jika ada masalah, kita bisa rollback.

---

### **Step 2: Deploy New Code** ⏱️ 10 minutes

```bash
# 1. Install dependencies (jika ada yang baru)
npm install

# 2. Build production
npm run build

# 3. Test locally first
npm run dev

# 4. Deploy ke production
# Vercel:
vercel --prod

# Or manual deployment:
npm run start
```

**Verification:**
- ✅ App builds without errors
- ✅ No TypeScript errors
- ✅ `/api/midtrans/notification` accessible (GET should return 200)

---

### **Step 3: Setup Webhook** ⏱️ 15 minutes

#### **3.1. Get Production URL**

```bash
# Example:
https://ventora-coffee.vercel.app/api/midtrans/notification
```

#### **3.2. Configure Midtrans Dashboard**

**Sandbox (for testing):**
1. Login: https://dashboard.sandbox.midtrans.com/
2. Settings → Configuration
3. Set **Payment Notification URL**:
   ```
   https://your-domain.com/api/midtrans/notification
   ```
4. Enable **HTTP Notification (POST)**
5. Save

**Production:**
1. Login: https://dashboard.midtrans.com/
2. Same steps as sandbox
3. Use production URL

#### **3.3. Test Webhook**

```bash
# Method 1: Via Midtrans Dashboard
1. Go to Transactions
2. Create test transaction
3. Click "Send Notification"
4. Check server logs

# Method 2: Via cURL
curl -X GET https://your-domain.com/api/midtrans/notification

# Expected response:
{
  "message": "Midtrans Webhook Endpoint",
  "status": "active"
}
```

---

### **Step 4: Migrate Existing Orders** ⏱️ 30 minutes

#### **Option A: Soft Migration (Recommended)**

Tidak perlu migrasi data lama. Old orders tetap berfungsi.

**Behavior:**
- Old orders (tanpa payment record) → Create new payment saat user retry
- New orders (dengan payment record) → Resume payment existing

**Advantages:**
- ✅ Zero downtime
- ✅ No data migration needed
- ✅ Backward compatible

#### **Option B: Hard Migration (Optional)**

Jika ingin create payment records untuk existing pending orders:

```typescript
// Script: migrate-existing-orders.ts
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { createPayment, generateTransactionId } from "@/lib/payment";

async function migrateExistingOrders() {
  // 1. Get all pending orders
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("status", "==", "menunggu_pembayaran"));
  const snapshot = await getDocs(q);

  console.log(`Found ${snapshot.size} pending orders`);

  // 2. Create payment records for each
  for (const doc of snapshot.docs) {
    const order = doc.data();
    
    if (!order.orderId) {
      console.log(`Skipping order ${doc.id} - no orderId`);
      continue;
    }

    try {
      // Note: Ini akan create payment BARU, user harus pilih metode lagi
      // Karena kita tidak punya payment URL dari transaksi lama
      console.log(`Creating payment record for order ${order.orderId}...`);
      
      // Skip - biarkan user create payment saat retry
      console.log(`Skipped - let user create payment on retry`);
      
    } catch (error) {
      console.error(`Error migrating order ${order.orderId}:`, error);
    }
  }

  console.log("Migration complete!");
}

// Run: ts-node migrate-existing-orders.ts
migrateExistingOrders();
```

**Recommendation:** Gunakan Option A (Soft Migration). Lebih aman dan user-friendly.

---

### **Step 5: Monitor & Verify** ⏱️ 24-48 hours

#### **5.1. Check Logs**

Monitor logs untuk memastikan webhook berfungsi:

```bash
# Expected logs:
[Webhook] Received Midtrans notification
[Webhook] Signature verification: VALID
[Webhook] Payment status updated: payment123 → PAID
[Webhook] Order status updated: order123 → sedang_diproses
```

#### **5.2. Test All Scenarios**

- [ ] **New checkout flow**
  - [ ] User checkout → payment berhasil
  - [ ] User checkout → keluar sebelum bayar → retry → resume payment
  - [ ] User checkout → wait 24h → retry → create new payment

- [ ] **Webhook scenarios**
  - [ ] Payment success → order status updated
  - [ ] Payment pending → order tetap pending
  - [ ] Payment failed → order status dibatalkan
  - [ ] Duplicate webhook → idempotent (no duplicate processing)

- [ ] **Edge cases**
  - [ ] User membuka 2 tab → klik Bayar di both → only 1 payment
  - [ ] Payment expired → user retry → new payment created
  - [ ] User tidak kembali setelah bayar → webhook update otomatis

#### **5.3. Monitor Errors**

```typescript
// Setup error tracking (optional)
// Example: Sentry, LogRocket, etc.

// In webhook handler:
if (error) {
  // Send to error tracking service
  captureException(error, {
    tags: { type: "webhook_error" },
    extra: { notification: notificationData }
  });
}
```

---

## 🔄 Rollback Plan

Jika ada masalah serius:

### **Step 1: Disable Webhook**

1. Go to Midtrans Dashboard
2. Settings → Configuration
3. Clear **Payment Notification URL**
4. Save

### **Step 2: Revert Code**

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or manual rollback via Vercel dashboard
```

### **Step 3: Restore Database (jika perlu)**

```bash
# Via Firebase Console:
# 1. Go to Firestore Database
# 2. Click "Import/Export"
# 3. Import backup file
```

### **Step 4: Clear Cache**

```bash
# Clear browser cache
# Clear localStorage
localStorage.clear();
```

---

## ✅ Migration Checklist

### **Pre-Migration**
- [ ] Backup Firestore database
- [ ] Backup environment variables
- [ ] Test all changes locally
- [ ] Review code changes
- [ ] Update documentation

### **Migration**
- [ ] Deploy new code to production
- [ ] Verify deployment successful
- [ ] Setup webhook di Midtrans (sandbox)
- [ ] Test webhook dengan sandbox
- [ ] Setup webhook di Midtrans (production)
- [ ] Test webhook dengan production

### **Post-Migration**
- [ ] Monitor logs for 24 hours
- [ ] Test all payment scenarios
- [ ] Check error rates
- [ ] Verify payment success rate
- [ ] Monitor user feedback
- [ ] Update status in team

### **Cleanup (after 7 days)**
- [ ] Remove deprecated code (`/api/midtrans/continue`)
- [ ] Remove deprecated functions (`saveTransactionId`, etc.)
- [ ] Clean up old localStorage keys
- [ ] Archive old payment logs

---

## 📊 Success Metrics

Monitor these metrics post-migration:

| Metric | Before | Target After | Notes |
|--------|--------|--------------|-------|
| Payment Success Rate | ? | >90% | Via webhook logs |
| User Retry Rate | High | Low | Users not recreating payments |
| Payment Resume Rate | 0% | >50% | Users resuming existing payments |
| Webhook Success Rate | N/A | >99% | Notification processing |
| Average Payment Time | ? | <5 min | Time from checkout to paid |
| User Complaints | ? | <5/month | Payment UX issues |

---

## 🆘 Troubleshooting

### **Problem: Webhook tidak diterima**

**Symptoms:**
- Payment berhasil tapi order tidak update
- Logs tidak ada `[Webhook] Received...`

**Solutions:**
1. Check webhook URL di Midtrans dashboard
2. Test dengan "Send Notification" button
3. Check firewall/security settings
4. Verify production URL accessible dari internet
5. Check server logs untuk errors

**Quick Test:**
```bash
curl https://your-domain.com/api/midtrans/notification
# Should return 200 OK
```

---

### **Problem: Signature verification failed**

**Symptoms:**
- Log: `[Webhook] Signature verification: INVALID`
- Webhook returns 403

**Solutions:**
1. Verify `MIDTRANS_SERVER_KEY` correct
2. Check environment (sandbox vs production)
3. Verify server key tidak ada extra spaces
4. Check Midtrans notification actual data

**Debug:**
```typescript
// In notification/route.ts, add logging:
console.log("Server Key:", serverKey?.substring(0, 10));
console.log("Order ID:", order_id);
console.log("Status Code:", status_code);
console.log("Gross Amount:", gross_amount);
console.log("Signature:", signature_key);
```

---

### **Problem: Payment tidak resume**

**Symptoms:**
- User klik "Bayar Sekarang"
- Harus pilih metode pembayaran lagi

**Solutions:**
1. Check payment record exists di Firestore
2. Check payment status = PENDING
3. Check payment belum expired
4. Check console logs:
   ```
   [Pesanan] Found existing payment, resuming: payment123
   ```
5. Verify `paymentUrl` field ada di payment record

**Debug:**
```typescript
// In pesanan page, add logging:
const payment = await getActivePayment(order.orderId);
console.log("Active payment:", payment);
```

---

### **Problem: Duplicate payments created**

**Symptoms:**
- Multiple payments dengan orderId yang sama
- User confused tentang which payment to use

**Solutions:**
1. Check `getActivePayment()` function
2. Verify race condition handling
3. Add loading state untuk prevent double-click
4. Check logs untuk duplicate creation

**Prevention:**
```typescript
// Already implemented in pesanan page:
const [isProcessing, setIsProcessing] = useState<string | null>(null);

// Prevent double-click:
<button disabled={isProcessing === order.id} ...>
```

---

## 📞 Support Contacts

**Technical Issues:**
- GitHub Issues: https://github.com/your-repo/issues
- Email: tech@ventora-coffee.com

**Midtrans Support:**
- Dashboard: https://dashboard.midtrans.com/
- Documentation: https://docs.midtrans.com/
- Support Email: support@midtrans.com

---

## 🎓 Training Materials

### **For Developers**
- [PAYMENT_SETUP.md](./PAYMENT_SETUP.md) - Complete setup guide
- [CHANGELOG_PAYMENT.md](./CHANGELOG_PAYMENT.md) - What changed
- [src/types/payment.ts](./src/types/payment.ts) - Type definitions
- [src/lib/payment.ts](./src/lib/payment.ts) - Payment service

### **For QA/Testing**
- Test all scenarios in PAYMENT_SETUP.md
- Use Midtrans Simulator for sandbox testing
- Verify webhook notifications in dashboard

### **For Support Team**
- User reports "harus pilih metode lagi" → Check if webhook configured
- User reports "payment tidak update" → Check webhook logs
- User reports "payment expired" → Normal, ask to retry

---

## ✨ FAQ

**Q: Apakah order lama masih bisa dibayar?**
A: Ya! Order lama akan create new payment saat user retry. Backward compatible.

**Q: Berapa lama payment valid?**
A: 24 jam dari created. Setelah itu expired dan user harus create new payment.

**Q: Apa yang terjadi jika webhook gagal?**
A: Payment masih bisa diproses. User akan melihat status di finish page (fallback). Tapi webhook adalah source of truth yang lebih reliable.

**Q: Bisa cancel payment?**
A: Ya, via Midtrans dashboard. Webhook akan update status ke CANCELLED.

**Q: Support refund?**
A: Partial support. Manual refund via Midtrans dashboard akan trigger webhook. Implement refund UI di roadmap.

**Q: Bagaimana cara test di local?**
A: Gunakan ngrok untuk expose localhost, set ngrok URL di Midtrans sandbox.

---

## 🎉 Congratulations!

Jika semua checklist ✅, payment system Anda sekarang:
- ✅ Production-ready
- ✅ User-friendly
- ✅ Reliable
- ✅ Scalable
- ✅ Modern

Selamat! 🚀

---

**Document Version:** 1.0  
**Last Updated:** September 2, 2026  
**Next Review:** October 2, 2026
