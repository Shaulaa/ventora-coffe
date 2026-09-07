# Setup Firestore, Ventora Coffee

Dokumen ini menjelaskan cara setup Firestore untuk Ventora Coffee.

## Langkah-langkah Setup

### 1. Buat Collection di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project Anda
3. Klik **Firestore Database** di sidebar kiri
4. Klik **Create database**
5. Pilih **Start in test mode** (untuk development), lalu pilih lokasi server
6. Setelah database dibuat, buat collection yang dibutuhkan:

| Collection | Deskripsi |
|------------|-----------|
| `products` | Data produk menu |
| `orders` | Pesanan pelanggan |
| `reservations` | Reservasi meja |
| `reviews` | Ulasan produk |
| `promos` | Promo banner |
| `users` | Data user + role |

### 2. Setup Firestore Security Rules

1. Di Firebase Console, buka **Firestore Database** > **Rules**
2. Copy isi file [`firestore.rules`](../firestore.rules) dari project ini
3. Paste ke Firebase Console Rules editor
4. Klik **Publish**

Rules ini mengatur:
- `products`: Siapa bisa baca, admin saja yang bisa tulis
- `orders`: User cuma bisa akses order miliknya sendiri
- `reservations`: Sama seperti orders
- `reviews`: Siapa bisa baca, user bisa review produknya sendiri
- `promos`: Siapa bisa baca, admin saja yang bisa tulis
- `users`: User cuma bisa akses profile sendiri, role cuma bisa diubah dari Firebase Console

### 3. Migrate Data Dummy ke Firestore

Saat ini data produk masih di [`dummy-products.ts`](../src/lib/dummy-products.ts). Untuk migrate ke Firestore:

#### Opsi A: Manual (untuk development)
1. Buka Firebase Console > Firestore > `products` collection
2. Klik **Add document**
3. Isi field sesuai dengan data di `dummy-products.ts`

#### Opsi B: Programmatic (via script)
Buat script sementara di `src/scripts/migrate-products.ts`:

```typescript
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { products } from "@/lib/dummy-products";

async function migrate() {
  const productsRef = collection(db, "products");
  
  for (const product of products) {
    await addDoc(productsRef, {
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      icon: product.icon,
      ratingAverage: product.rating,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Added: ${product.name}`);
  }
  
  console.log("Migration complete!");
}

migrate().catch(console.error);
```

Jalankan dengan:
```bash
npx tsx src/scripts/migrate-products.ts
```

### 4. Setup Environment Variables

Buat file `.env.local` (jangan commit ke git!):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Copy dari Firebase Console > Project Settings > General > Your apps > Web App

### 5. Verification

Setelah setup, verifikasi dengan:
```bash
npm run dev
```

Kunjungi `/menu` — produk seharusnya muncul dari Firestore (bukan dummy data).

## Troubleshooting

### Firebase belum dikonfigurasi
Periksa `.env.local` — pastikan semua Firebase config terisi.

### Permission denied
Periksa Firestore Security Rules — pastikan rules sudah di-publish dan sesuai dengan [`firestore.rules`](../firestore.rules).

### Data tidak muncul
1. Cek di Firebase Console apakah collection `products` ada datanya
2. Cek di browser console untuk error
3. Pastikan rules allow read untuk products: `allow read: if true;`
