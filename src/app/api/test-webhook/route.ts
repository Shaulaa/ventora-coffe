import { NextResponse } from "next/server";
import crypto from "crypto";

const serverKey = process.env.MIDTRANS_SERVER_KEY;

/**
 * Test endpoint untuk simulate Midtrans webhook notification
 * Development only - DO NOT use in production!
 */
export async function POST(request: Request) {
  const body = await request.json();
  
  const {
    order_id = "VENTORA-ORD-TEST-001",
    transaction_status = "settlement",
    gross_amount = "50000",
  } = body;

  // Generate signature
  const status_code = "200";
  const input = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const signature_key = crypto.createHash("sha512").update(input).digest("hex");

  // Create mock notification
  const notification = {
    transaction_time: new Date().toISOString(),
    transaction_status,
    transaction_id: `test-tx-${Date.now()}`,
    status_message: "Test notification",
    status_code,
    signature_key,
    settlement_time: new Date().toISOString(),
    payment_type: "qris",
    order_id,
    merchant_id: "test-merchant",
    gross_amount,
    fraud_status: "accept",
    currency: "IDR",
  };

  console.log("[Test Webhook] Sending test notification:", notification);

  // Send to real webhook endpoint
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/midtrans/notification`;
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    });

    const result = await response.json();

    return NextResponse.json({
      message: "Test notification sent",
      notification,
      webhookResponse: result,
      webhookStatus: response.status,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to send test notification",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

/**
 * GET endpoint untuk test dengan query params
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId") || "VENTORA-ORD-TEST-001";
  const status = searchParams.get("status") || "settlement";
  const amount = searchParams.get("amount") || "50000";

  // Send POST request to self
  const url = new URL("/api/test-webhook", request.url);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderId,
      transaction_status: status,
      gross_amount: amount,
    }),
  });

  return response;
}
