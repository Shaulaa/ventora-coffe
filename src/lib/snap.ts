// Midtrans Snap.js Integration
// Alur: minta token dari API route (server-side, pakai SERVER KEY),
// lalu redirect/popup ke Midtrans.
//
// IMPORTANT: Payment sekarang persistent - jangan buat transaction baru setiap kali retry!

const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

/**
 * Check apakah Midtrans sudah ter-load
 */
function isSnapLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.Snap !== "undefined";
}

/**
 * Load Midtrans Snap.js dynamically dari CDN
 * Returns true if loaded, false if failed
 */
async function loadSnapScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Cek apakah sudah load
    if (isSnapLoaded()) {
      console.log("[Snap] window.Snap already loaded");
      resolve(true);
      return;
    }

    if (!midtransClientKey) {
      console.warn("[Snap] No client key configured");
      resolve(false);
      return;
    }

    // Hapus script lama kalau ada (untuk hot reload / retry)
    const oldScript = document.getElementById("midtrans-snap-script");
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement("script");
    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    console.log("[Snap] Loading script from:", snapUrl);

    script.id = "midtrans-snap-script";
    script.src = snapUrl;
    script.setAttribute("data-client-key", midtransClientKey);
    script.async = true;
    script.crossOrigin = "anonymous";

    // Timeout untuk load script (10 detik)
    const timeout = setTimeout(() => {
      console.warn("[Snap] Script load timeout");
      resolve(false);
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      console.log("[Snap] Script loaded successfully");
      // Midtrans script self-initializes
      setTimeout(() => {
        if (isSnapLoaded()) {
          resolve(true);
        } else {
          // Script loaded tapi belum initialize, tunggu sebentar
          let attempts = 0;
          const checkInit = setInterval(() => {
            attempts++;
            if (isSnapLoaded()) {
              clearInterval(checkInit);
              resolve(true);
            } else if (attempts > 10) {
              clearInterval(checkInit);
              console.warn("[Snap] Snap not initialized after 2s");
              resolve(false);
            }
          }, 200);
        }
      }, 100);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      console.error("[Snap] Failed to load script:", snapUrl);
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/**
 * DEPRECATED: Jangan gunakan ini lagi!
 * Transaction ID sekarang STATIC dan dihandle oleh payment service.
 * 
 * @deprecated Use generateTransactionId from @/lib/payment instead
 */
function generateUniqueOrderId(baseOrderId: string): string {
  console.warn("[Snap] generateUniqueOrderId is deprecated!");
  return baseOrderId;
}

/**
 * Resume existing payment (untuk retry payment tanpa create transaction baru)
 * 
 * @param paymentUrl - Payment URL dari payment record yang sudah ada
 */
export async function resumeExistingPayment(paymentUrl: string): Promise<void> {
  console.log("[Snap] Resuming existing payment");
  
  // Buka payment URL di tab/window baru
  window.open(paymentUrl, "_blank");
}

/**
 * Show Midtrans payment via redirect ke payment page
 * Ini approach yang lebih reliable dibanding popup (tidak terpengaruh CSP)
 * 
 * IMPORTANT: Ini hanya dipanggil untuk payment BARU (bukan retry)
 */
export async function showMidtransPaymentRedirect({
  orderId,
  totalAmount,
  customerDetails,
  itemDetails,
}: {
  orderId: string;
  totalAmount: number;
  customerDetails: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}): Promise<{ token: string; redirectUrl: string; transactionId: string }> {
  console.log("[Snap] Creating NEW payment transaction");
  console.log("[Snap] Order ID:", orderId);
  console.log("[Snap] Total:", totalAmount);

  // 1. Minta token + redirect URL dari API route
  // API akan generate STATIC transaction ID
  const res = await fetch("/api/midtrans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      totalAmount,
      customerDetails,
      itemDetails,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal membuat transaksi Midtrans");
  }

  const data = await res.json();
  console.log("[Snap] Received token, redirect URL, and transaction ID");

  if (!data.token || !data.redirectUrl || !data.transactionId) {
    throw new Error("Response dari Midtrans tidak lengkap");
  }

  return {
    token: data.token,
    redirectUrl: data.redirectUrl,
    transactionId: data.transactionId,
  };
}

/**
 * DEPRECATED: Midtrans Continue API tidak reliable.
 * Gunakan resume payment dengan payment URL yang sudah disimpan.
 * 
 * @deprecated Use getActivePayment() and resumeExistingPayment() instead
 */
export async function continueMidtransPaymentRedirect(): Promise<string | null> {
  console.warn("[Snap] continueMidtransPaymentRedirect is deprecated!");
  return null;
}

/**
 * DEPRECATED: Transaction tracking sekarang di database (payments collection).
 * 
 * @deprecated No longer needed - use payments collection from database
 */
export function saveTransactionId(orderId: string, transactionId: string): void {
  console.warn("[Snap] saveTransactionId is deprecated - using database instead");
}

/**
 * DEPRECATED: Transaction tracking sekarang di database (payments collection).
 * 
 * @deprecated Use getActivePayment() from @/lib/payment instead
 */
export function getLastTransaction(): { orderId: string; transactionId: string } | null {
  console.warn("[Snap] getLastTransaction is deprecated - use getActivePayment() instead");
  return null;
}

/**
 * Clear pending order dari localStorage setelah payment sukses
 */
export function clearLastTransaction(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ventora_pending_order");
    localStorage.removeItem("ventora_last_order_id");
    console.log("[Snap] Cleared pending order data");
  }
}

/**
 * Create Midtrans transaction dan buka Snap popup/redirect (popup mode).
 * Ini hanya untuk payment BARU, bukan retry.
 * 
 * Returns: { token, redirectUrl, transactionId }
 */
export async function showMidtransPayment({
  orderId,
  totalAmount,
  customerDetails,
  itemDetails,
  onTransactionFinished,
  onTransactionPending,
  onTransactionError,
}: {
  orderId: string;
  totalAmount: number;
  customerDetails: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  onTransactionFinished?: (result: unknown) => void;
  onTransactionPending?: (result: unknown) => void;
  onTransactionError?: (result: unknown) => void;
}): Promise<{ token: string; redirectUrl: string; transactionId: string }> {
  console.log("[Snap] Creating new payment transaction");

  try {
    // 1. Create transaction via API
    const paymentData = await showMidtransPaymentRedirect({
      orderId,
      totalAmount,
      customerDetails,
      itemDetails,
    });

    // 2. Coba load Snap.js untuk popup mode
    const loaded = await loadSnapScript();

    if (!loaded || !window.Snap) {
      // Fallback: gunakan redirect mode
      console.log("[Snap] Using redirect mode");
      window.open(paymentData.redirectUrl, "_blank");
      onTransactionPending?.({ mode: "redirect" });
      return paymentData;
    }

    // 3. Buka Snap popup
    console.log("[Snap] Using popup mode");
    window.Snap.pay(paymentData.token, {
      onSuccess: (result: unknown) => {
        const r = result as { transaction_status?: string };
        const status = r?.transaction_status;
        if (status === "settlement" || status === "capture") {
          clearLastTransaction();
          onTransactionFinished?.(result);
        } else {
          onTransactionPending?.(result);
        }
      },
      onPending: (result: unknown) => {
        onTransactionPending?.(result);
      },
      onError: (result: unknown) => {
        onTransactionError?.(result);
      },
      onClose: () => {
        console.log("[Snap] User closed popup");
      },
    } as Parameters<typeof window.Snap.pay>[1]);

    return paymentData;
  } catch (error) {
    console.error("[Snap] Error creating payment:", error);
    onTransactionError?.(error);
    throw error;
  }
}

/**
 * Close Snap popup (untuk cancel)
 */
export function closeMidtransPayment() {
  if (typeof window !== "undefined" && window.Snap) {
    window.Snap.close();
  }
}

/**
 * DEPRECATED: Midtrans Continue API tidak reliable.
 * Gunakan resume payment dengan payment URL yang sudah disimpan.
 * 
 * @deprecated Use getActivePayment() and resumeExistingPayment() instead
 */
export async function continueMidtransPayment(
  orderId: string
): Promise<{ token: string; redirectUrl: string } | null> {
  try {
    console.warn("[Snap] continueMidtransPayment is deprecated!");
    console.log("[Snap] Attempting to continue transaction:", orderId);

    const res = await fetch("/api/midtrans/continue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();

    if (!res.ok || !data.canContinue) {
      console.log("[Snap] Continue failed or not available:", data.error);
      return null;
    }

    const redirectUrl =
      data.redirectUrl ||
      `https://app.sandbox.midtrans.com/snap/v2/vtweb/${data.token}`;

    console.log("[Snap] Continue successful, redirect URL:", redirectUrl);
    return { token: data.token, redirectUrl };
  } catch (error) {
    console.error("[Snap] Continue transaction error:", error);
    return null;
  }
}
