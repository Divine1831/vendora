import { NextResponse } from "next/server";
import { expirePendingCheckouts } from "@/lib/payments/paystack";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const released = await expirePendingCheckouts();
  return NextResponse.json({ released });
}
