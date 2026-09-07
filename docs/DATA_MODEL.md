# Data Model, Firestore

Status sekarang, BELUM ada satupun collection ini yang beneran dibikin di
Firestore. Data produk masih dummy di `src/lib/dummy-products.ts`. Dokumen
ini adalah skema yang harus diikutin begitu mulai konek ke Firestore beneran
(Fase 2 dan seterusnya).

## `products`

```
products/{productId}
  name: string
  category: "Signature" | "Klasik" | "Non-Kopi" | "Camilan"
  price: number
  description: string
  imageUrl: string
  ratingAverage: number      // dihitung ulang tiap ada review baru
  ratingCount: number
  createdAt: timestamp
  updatedAt: timestamp
```

## `orders`

```
orders/{orderId}
  userId: string
  items: Array<{ productId: string, name: string, price: number, qty: number }>
  total: number
  status: "menunggu" | "diproses" | "siap" | "selesai" | "dibatalkan"
  createdAt: timestamp
  updatedAt: timestamp
```

## `reservations`

```
reservations/{reservationId}
  userId: string
  name: string          // nama pemesan
  phone: string         // nomor WhatsApp buat konfirmasi
  date: string          // format YYYY-MM-DD
  time: string          // format HH:mm
  guestCount: number
  note: string          // opsional, catatan tambahan
  status: "menunggu" | "dikonfirmasi" | "ditolak" | "selesai" | "dibatalkan"
  createdAt: timestamp
  updatedAt: timestamp
```

Alur status: user bikin reservasi -> `menunggu`. Admin bisa `dikonfirmasi`
atau `ditolak`. Setelah dikonfirmasi, admin bisa tandai `selesai`. User bisa
membatalkan reservasi miliknya sendiri (`dibatalkan`) selama masih `menunggu`
atau `dikonfirmasi`.

## `reviews`

```
reviews/{reviewId}
  productId: string
  userId: string
  rating: number         // 1 sampai 5
  comment: string
  createdAt: timestamp
```

Setiap review baru, `ratingAverage` dan `ratingCount` di document produk
terkait harus diupdate (idealnya lewat Cloud Function, biar konsisten,
bukan dihitung di client).

## `promos`

```
promos/{promoId}
  title: string
  description: string
  imageUrl: string
  startDate: timestamp
  endDate: timestamp
  isActive: boolean
```

## `users`

Data auth dasar (email, uid) dikelola otomatis sama Firebase Auth. Data
tambahan role disimpen terpisah di Firestore.

```
users/{uid}
  role: "customer" | "admin"
  displayName: string
  createdAt: timestamp
```

Default role pas register selalu `"customer"`. Role `"admin"` cuma boleh
di-set manual lewat Firebase Console, jangan pernah expose cara ubah role
lewat UI aplikasi.

## Firestore Security Rules, wajib sebelum publik

Prinsip dasarnya, jangan pernah percaya client buat validasi permission.

- `products`, siapa aja boleh baca, cuma `role == "admin"` yang boleh tulis
- `orders`, user cuma boleh baca/tulis dokumen order miliknya sendiri
  (`resource.data.userId == request.auth.uid`), admin boleh baca/update semua
- `reservations`, sama polanya kayak `orders`
- `reviews`, siapa aja boleh baca, user cuma boleh bikin review atas nama
  dirinya sendiri (userId harus cocok sama auth.uid), gak boleh edit review
  orang lain
- `promos`, siapa aja boleh baca, cuma admin yang boleh tulis
- `users`, tiap user cuma boleh baca dokumennya sendiri, field `role` cuma
  boleh diubah dari Firebase Console, bukan lewat client rules
