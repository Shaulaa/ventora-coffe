"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { showMidtransPayment } from "@/lib/snap";
import { Loader2, MapPin, Phone, Mail } from "lucide-react";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

type CustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-fill dari user jika login
  useEffect(() => {
    if (user) {
      setCustomerDetails((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.email?.split("@")[0] || "",
      }));
    }
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCheckout() {
    if (!user) {
      setError("Silakan login terlebih dahulu");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!customerDetails.firstName || !customerDetails.phone || !customerDetails.address) {
      setError("Mohon lengkapi data pengiriman");
      return;
    }

    if (items.length === 0) {
      setError("Keranjang kosong");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Siapkan item details untuk Midtrans
      const itemDetails = items.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.qty,
        name: item.name,
      }));

      // Buka Snap popup Midtrans (token diminta dari /api/midtrans)
      // Generate unique order ID dengan timestamp + random string
      const uniqueOrderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await showMidtransPayment({
        orderId: uniqueOrderId,
        totalAmount: totalPrice,
        customerDetails: {
          firstName: customerDetails.firstName,
          lastName: customerDetails.lastName,
          email: customerDetails.email,
          phone: customerDetails.phone,
        },
        itemDetails,
        onTransactionFinished: () => {
          // Dipanggil hanya saat status = settlement/capture (verified di snap.ts)
          clearCart();
          setSuccess(true);
        },
        onTransactionPending: () => {
          // Pembayaran pending (misal: bank transfer) - jangan clear cart!
          setError("Pembayaran sedang diproses. Silakan selesaikan pembayaran di halaman Midtrans.");
        },
        onTransactionError: () => {
          // Pembayaran gagal atau user cancel - jangan clear cart!
          setError("Pembayaran gagal. Coba lagi.");
        },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error ? err.message : "Gagal memproses checkout. Coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage/10">
            <svg className="h-10 w-10 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-4xl">Pesanan Berhasil!</h1>
          <p className="mt-4 text-foreground/70">
            Terima kasih atas pesanan kamu. Kami akan segera memprosesnya.
          </p>
          <p className="mt-2 text-sm text-foreground/50">
            Total: {formatRupiah(totalPrice)}
          </p>
          <Link
            href="/pesanan"
            className="mt-8 inline-block rounded-full bg-rust px-8 py-3 text-sm font-medium text-paper hover:opacity-90"
          >
            Lihat Status Pesanan
          </Link>
          <Link
            href="/menu"
            className="mt-4 inline-block text-rust hover:underline"
          >
            Beli Lagi
          </Link>
        </section>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-screen-lg px-6 py-16">
          <div className="rounded-2xl border border-dashed border-border-soft p-10 text-center">
            <p className="text-foreground/70">Keranjang kamu masih kosong.</p>
            <Link
              href="/menu"
              className="mt-4 inline-block rounded-full bg-rust px-6 py-2.5 text-sm text-paper"
            >
              Lihat Menu
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-screen-xl px-6 py-16">
        <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
          Checkout
        </p>
        <h1 className="mt-1 font-display text-4xl">Selesaikan pesanan kamu</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Customer Info Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border-soft bg-surface p-6">
              <h2 className="font-display text-xl">Informasi Pengiriman</h2>
              <p className="mt-1 text-sm text-foreground/60">
                Masukkan detail pengiriman untuk pesanan kamu.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-rust/10 border border-rust/20 p-4 text-sm text-rust dark:bg-rust/20 dark:border-rust/30">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">Nama Depan *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={customerDetails.firstName}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 focus:border-rust focus:outline-none focus:ring-1 focus:ring-rust/20 dark:border-border-soft/50 dark:bg-espresso"
                      placeholder="Contoh: Budi"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Nama Belakang</label>
                    <input
                      type="text"
                      name="lastName"
                      value={customerDetails.lastName}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 focus:border-rust focus:outline-none focus:ring-1 focus:ring-rust/20 dark:border-border-soft/50 dark:bg-espresso"
                      placeholder="Contoh: Santoso"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-foreground/40" />
                    <input
                      type="email"
                      name="email"
                      value={customerDetails.email}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-border-soft bg-background pl-10 pr-4 py-2.5 focus:border-rust focus:outline-none focus:ring-1 focus:ring-rust/20 dark:border-border-soft/50 dark:bg-espresso"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Nomor HP *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-foreground/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={customerDetails.phone}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-border-soft bg-background pl-10 pr-4 py-2.5 focus:border-rust focus:outline-none focus:ring-1 focus:ring-rust/20 dark:border-border-soft/50 dark:bg-espresso"
                      placeholder="0812-3456-7890"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Alamat Lengkap *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-foreground/40" />
                    <textarea
                      name="address"
                      value={customerDetails.address}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-border-soft bg-background pl-10 pr-4 py-2.5 focus:border-rust focus:outline-none focus:ring-1 focus:ring-rust/20 dark:border-border-soft/50 dark:bg-espresso"
                      placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-full bg-rust py-4 text-lg font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Mempersiapkan Pembayaran...
                </span>
              ) : (
                `Bayar Sekarang - ${formatRupiah(totalPrice)}`
              )}
            </button>
            <p className="text-center text-xs text-foreground/50">
              By checkout, you agree to our Terms & Conditions
            </p>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-border-soft bg-surface p-6">
              <h2 className="font-display text-xl">Ringkasan Pesanan</h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-dim text-xl dark:bg-espresso">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-foreground/60">
                        Qty: {item.qty} x {formatRupiah(item.price)}
                      </p>
                    </div>
                    <p className="font-data text-sm">
                      {formatRupiah(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 border-t border-border-soft pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-data">{formatRupiah(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Biaya Pengiriman</span>
                  <span className="font-data"> Gratis</span>
                </div>
                <div className="flex justify-between border-t border-border-soft pt-4 font-display text-xl">
                  <span>Total</span>
                  <span className="font-data">{formatRupiah(totalPrice)}</span>
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-paper-dim p-4 text-xs text-foreground/60 dark:bg-espresso-light">
                <p className="mb-2">
                  <span className="font-medium">Pembayaran:</span> Midtrans (aman & terpercaya)
                </p>
                <p>
                  <span className="font-medium">Status:</span> Menunggu pembayaran
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
