import { NextResponse } from "next/server";

// Midtrans Continue Transaction API
// https://api.midtrans.com/v2/{order_id}/continue

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;

const CONTINUE_URL = isProduction
  ? "https://app.midtrans.com/v2"
  : "https://app.sandbox.midtrans.com/v2";

export async function POST(request: Request) {
  if (!serverKey) {
    return NextResponse.json(
      { error: "Midtrans server key tidak dikonfigurasi" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID diperlukan" },
        { status: 400 }
      );
    }

    console.log("[Midtrans Continue] Attempting to continue order:", orderId);

    // Basic auth pakai server key
    const authString = Buffer.from(`${serverKey}:`).toString("base64");

    const response = await fetch(`${CONTINUE_URL}/${orderId}/continue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    console.log("[Midtrans Continue] Response status:", response.status);
    console.log("[Midtrans Continue] Response:", JSON.stringify(data));

    if (!response.ok) {
      // 404 = transaction not found (sudah settle atau kadaluarsa)
      // 412 = transaction tidak bisa di-continue (status tidak valid)
      console.error("[Midtrans Continue] Error:", data);
      return NextResponse.json(
        { error: data.error_messages || "Tidak bisa melanjutkan transaksi", canContinue: false },
        { status: response.status }
      );
    }

    // Midtrans return { status_code, redirect_url, token }
    return NextResponse.json({
      token: data.token,
      redirectUrl: data.redirect_url,
      statusCode: data.status_code,
      canContinue: true,
    });
  } catch (error) {
    console.error("[Midtrans Continue] Exception:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", canContinue: false },
      { status: 500 }
    );
  }
}
