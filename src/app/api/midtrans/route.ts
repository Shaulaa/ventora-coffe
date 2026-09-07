import { NextResponse } from "next/server";
import { generateTransactionId } from "@/lib/payment";

// Midtrans Snap API endpoint
// Sandbox: https://app.sandbox.midtrans.com/snap/v1/transactions
// Production: https://app.midtrans.com/snap/v1/transactions

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const SNAP_URL = isProduction
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

export async function POST(request: Request) {
  // Debug logging
  console.log("[Midtrans API] Server key exists:", !!serverKey);
  console.log("[Midtrans API] Server key prefix:", serverKey?.substring(0, 10));
  console.log("[Midtrans API] Is production:", isProduction);
  console.log("[Midtrans API] Snap URL:", SNAP_URL);

  if (!serverKey) {
    return NextResponse.json(
      { error: "Midtrans server key tidak dikonfigurasi" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { orderId, totalAmount, customerDetails, itemDetails } = body;

    console.log("[Midtrans API] Request data:", { orderId, totalAmount, itemCount: itemDetails?.length });

    // Validasi input
    if (!orderId || !totalAmount || !itemDetails) {
      return NextResponse.json(
        { error: "Data transaksi tidak lengkap" },
        { status: 400 }
      );
    }

    // Midtrans requires gross_amount to be an integer (no decimals)
    const grossAmount = Math.round(totalAmount);

    // Generate STATIC transaction ID (tidak berubah saat retry)
    // Format: VENTORA-ORD-001
    const transactionId = generateTransactionId(orderId);
    console.log("[Midtrans API] Transaction ID:", transactionId);

    // Basic auth pakai server key (base64 encoded)
    const authString = Buffer.from(`${serverKey}:`).toString("base64");

    // Return URL untuk setelah payment selesai
    const returnUrl = `${appUrl}/payment/finish`;

    // Build params untuk Midtrans
    const params: Record<string, unknown> = {
      transaction_details: {
        order_id: transactionId, // Gunakan transaction ID yang static
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerDetails?.firstName || "Customer",
        last_name: customerDetails?.lastName || "",
        email: customerDetails?.email || "",
        phone: customerDetails?.phone || "",
      },
      item_details: itemDetails.map((item: { id: string; price: number; quantity: number; name: string }) => ({
        ...item,
        price: Math.round(item.price),
      })),
      // Enable semua payment methods
      enabled_payments: [
        "credit_card",
        "gopay",
        "shopeepay",
        "qris",
        "bca_va",
        "bni_va",
        "bri_va",
        "mandiri_va",
        "permata_va",
        "cimb_clicks",
        "danamon_online",
        "uob_ezpay",
        "bca_klikpay",
        "echannel",
        "akulaku",
        "kredivo",
      ],
      callbacks: {
        finish: returnUrl,
      },
      metadata: {
        // Simpan order ID asli untuk tracking
        original_order_id: orderId,
      },
    };

    console.log("[Midtrans API] Creating transaction with params");

    const response = await fetch(SNAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    console.log("[Midtrans API] Response status:", response.status);

    if (!response.ok) {
      console.error("[Midtrans API] Error:", data);
      return NextResponse.json(
        { error: data.error_messages || "Gagal membuat transaksi" },
        { status: response.status }
      );
    }

    // Return token, redirect_url, dan transaction_id
    return NextResponse.json({
      token: data.token,
      redirectUrl: data.redirect_url,
      transactionId, // Kembalikan transaction ID untuk disimpan di payments collection
    });
  } catch (error) {
    console.error("[Midtrans API] Exception:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
