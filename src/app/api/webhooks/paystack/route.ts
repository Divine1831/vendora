import { NextResponse } from "next/server";
import { processPaystackWebhookEvent, verifyPaystackWebhookSignature } from "@/lib/payments/paystack";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = Buffer.from(await request.arrayBuffer());
  if (!verifyPaystackWebhookSignature(rawBody, request.headers)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: { event?: string; data?: { id?: number | string; reference?: string; status?: string } };
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    await processPaystackWebhookEvent(event);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Paystack webhook processing failed", error);
    // Non-2xx asks Paystack to retry; never acknowledge an unprocessed successful payment.
    return NextResponse.json({ error: "Webhook processing failed. Please retry." }, { status: 500 });
  }
}
