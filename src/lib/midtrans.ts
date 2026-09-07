// DEPRECATED: file ini dulu pakai package @midtrans/client (server-side SDK)
// yang tidak tersedia di npm. Integrasi Midtrans sekarang lewat:
//   - src/app/api/midtrans/route.ts  (generate token, server-side, SERVER KEY)
//   - src/lib/snap.ts                (buka Snap popup, client-side, CLIENT KEY)
//
// Re-export untuk kompatibilitas dengan kode lama.
export { showMidtransPayment, closeMidtransPayment } from "./snap";
