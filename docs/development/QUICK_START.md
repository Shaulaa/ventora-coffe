# 🚀 Quick Start Guide - Payment System

**Goal:** Get the new payment system running in 15 minutes.

---

## ⚡ 15-Minute Setup

### **1. Verify Code** (2 min)

```bash
# Check TypeScript compilation
npm run build

# Expected: Build completed successfully ✅
```

### **2. Test Locally** (5 min)

```bash
# Start dev server
npm run dev

# Open browser: http://localhost:3000
# Test flow:
# 1. Go to /menu → Add to cart
# 2. Go to /keranjang → Checkout
# 3. Midtrans popup should open
# 4. Close popup (don't pay yet)
# 5. Go to /pesanan
# 6. Click "Bayar Sekarang"
# 7. Should resume same payment (NOT create new!)
```

### **3. Setup Webhook (5 min)**

```bash
# Terminal 1: Keep dev server running
npm run dev

# Terminal 2: Setup ngrok
npx ngrok http 3000

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
# Go to: https://dashboard.sandbox.midtrans.com/
# Settings → Configuration
# Payment Notification URL: https://abc123.ngrok.io/api/midtrans/notification
# Save
```

### **4. Test Webhook** (3 min)

```bash
# Test webhook endpoint
curl https://abc123.ngrok.io/api/midtrans/notification

# Expected response:
{
  "message": "Midtrans Webhook Endpoint",
  "status": "active"
}

# In Midtrans Dashboard:
# 1. Create test transaction
# 2. Click "Send Notification"
# 3. Check terminal logs:
[Webhook] Received Midtrans notification ✅
```

---

## 🎯 Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npx ngrok http 3000      # Expose localhost for webhook
curl http://localhost:3000/api/midtrans/notification  # Test webhook

# Deployment
vercel --prod            # Deploy to Vercel
```

---

## 📋 Pre-Flight Checklist

### **Environment Variables**
```bash
# Check .env.local has these:
MIDTRANS_SERVER_KEY=...                    ✅
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...        ✅
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false   ✅
NEXT_PUBLIC_APP_URL=http://localhost:3000  ✅
```

### **Test Scenarios**
- [ ] ✅ Checkout flow works
- [ ] ✅ Payment popup/redirect works
- [ ] ✅ Resume payment works (main feature!)
- [ ] ✅ Webhook endpoint accessible
- [ ] ✅ Webhook logs show in terminal

---

## 🐛 Common Issues

### **Issue: Build fails**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### **Issue: Webhook not received**
```bash
# Check ngrok still running
# Check Midtrans webhook URL correct
# Test with curl:
curl https://your-ngrok-url.ngrok.io/api/midtrans/notification
```

### **Issue: Payment not resuming**
```bash
# Check browser console for errors
# Check payment record created in Firestore
# Console → Firestore → payments collection
```

---

## 📚 Documentation Links

**For Setup:**  
→ [PAYMENT_SETUP.md](../payment/PAYMENT_SETUP.md) - Full architecture & setup

**For Deployment:**  
→ [MIGRATION_GUIDE.md](../payment/MIGRATION_GUIDE.md) - Step-by-step deployment

**For Debugging:**  
→ [PAYMENT_DEBUG.md](../payment/PAYMENT_DEBUG.md) - Troubleshooting guide

**For Overview:**  
→ [README_PAYMENT.md](../payment/README_PAYMENT.md) - Navigation hub

---

## 🎉 You're Ready!

After completing setup above, you should have:
- ✅ Payment system running locally
- ✅ Webhook receiving notifications
- ✅ Resume payment feature working
- ✅ Understanding of the flow

**Next:** Read [MIGRATION_GUIDE.md](../payment/MIGRATION_GUIDE.md) for production deployment!

---

**Time to complete:** ~15 minutes  
**Difficulty:** Easy  
**Status:** Ready to go! 🚀
