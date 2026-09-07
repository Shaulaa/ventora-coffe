# Firebase Setup Guide

## 🔥 Firestore Indexes

Payment system membutuhkan Firestore indexes untuk query yang efficient.

---

## 📋 Required Indexes

### **Index 1: payments - Active Payment Query**

**Collection:** `payments`  
**Fields:**
- `orderId` (Ascending)
- `paymentStatus` (Ascending)

**Usage:** Query untuk get active payment by order ID

---

## 🚀 Setup Methods

### **Method 1: Automatic (Recommended)**

1. Jalankan aplikasi dan trigger query
2. Firebase akan show error dengan link
3. Click link untuk auto-create index
4. Wait 2-5 minutes untuk index build

**Example Error:**
```
The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/...
```

**Action:** Click link tersebut!

---

### **Method 2: Manual via Console**

1. Go to: https://console.firebase.google.com/
2. Select project: `ventora-coffe`
3. Go to **Firestore Database**
4. Click **Indexes** tab
5. Click **Create Index**
6. Configure:
   - Collection: `payments`
   - Fields to index:
     - `orderId` → Ascending
     - `paymentStatus` → Ascending
7. Click **Create**
8. Wait 2-5 minutes

---

### **Method 3: via firestore.indexes.json**

File `firestore.indexes.json` sudah dibuat di root project.

**Deploy indexes:**

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

## 🧪 Verify Indexes

### **Check Index Status**

1. Go to Firebase Console
2. Firestore Database → Indexes
3. Look for:
   - Collection: `payments`
   - Status: **Enabled** ✅

### **Test Query**

```typescript
// This query should work without error
const payment = await getActivePayment("ORD-001");
console.log("Payment found:", payment);
```

---

## ⚠️ Common Issues

### **Issue: Index still building**

**Symptoms:**
```
The index is being built. Please try again shortly.
```

**Solution:** Wait 2-5 minutes. Indexes take time to build.

---

### **Issue: Index creation failed**

**Symptoms:**
```
Failed to create index
```

**Solution:**
1. Check Firebase quotas (free tier limits)
2. Check project permissions
3. Try again via console

---

### **Issue: Wrong project**

**Symptoms:**
```
Project not found
```

**Solution:**
1. Check `.firebaserc` file
2. Verify project ID: `ventora-coffe`
3. Run `firebase use ventora-coffe`

---

## 📊 Index Performance

| Query | Without Index | With Index |
|-------|---------------|------------|
| Get active payment | ❌ Error | ✅ <50ms |
| Get payment by transaction | ✅ OK | ✅ <50ms |
| Webhook lookup | ✅ OK | ✅ <50ms |

---

## 🔍 Monitoring

**Check index usage:**

1. Firebase Console
2. Firestore Database → Usage
3. Look at "Index reads"

**Optimize queries:**
- Minimize compound indexes
- Use single-field indexes when possible
- Monitor query performance

---

## 📚 References

- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Index Best Practices](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations)

---

## ✅ Setup Checklist

- [ ] Index created via error link OR console
- [ ] Index status: Enabled
- [ ] Test query successful
- [ ] No errors in console
- [ ] Application running smoothly

---

**Status:** Ready to go! 🚀  
**Time to complete:** 2-5 minutes  
**Difficulty:** Easy
