import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, paymentWebhookEvents, products } from "@/db/schema";

const PAYSTACK_API = "https://api.paystack.co";

function secretKey() {
  const value = process.env.PAYSTACK_SECRET_KEY;
  if (!value) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return value;
}

export function createPaymentReference() {
  return `VENDORA-${Date.now().toString(36)}-${randomBytes(12).toString("hex")}`;
}

export function amountToKobo(value: string | number) {
  const normalized = String(value).trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalized)) throw new Error("Invalid NGN amount.");
  const [whole, fraction = ""] = normalized.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount < 1) throw new Error("Payment amount must be at least ₦0.01.");
  return amount;
}

export async function initializePaystackTransaction(input: {
  email: string; amountKobo: number; reference: string; callbackUrl: string; orderId: string; businessId: string;
}) {
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { order_id: input.orderId, business_id: input.businessId, platform: "vendora" }
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });
  const payload = await response.json().catch(() => null) as {
    status?: boolean; message?: string; data?: { authorization_url?: string; access_code?: string; reference?: string }
  } | null;
  if (!response.ok || !payload?.status || !payload.data?.authorization_url || payload.data.reference !== input.reference) {
    throw new Error(payload?.message || "Paystack could not initialize this payment.");
  }
  const authorizationUrl = new URL(payload.data.authorization_url);
  if (authorizationUrl.protocol !== "https:" || authorizationUrl.hostname !== "checkout.paystack.com") {
    throw new Error("Paystack returned an unexpected checkout URL.");
  }
  return { authorizationUrl: authorizationUrl.toString(), accessCode: payload.data.access_code ?? null };
}

type VerifiedTransaction = {
  status: string; reference: string; amount: number; currency: string;
  customer?: { email?: string };
};

export async function verifyPaystackTransaction(reference: string): Promise<VerifiedTransaction> {
  if (!/^[A-Za-z0-9.=\-]{8,100}$/.test(reference)) throw new Error("Invalid payment reference.");
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` }, cache: "no-store", signal: AbortSignal.timeout(15000)
  });
  const payload = await response.json().catch(() => null) as { status?: boolean; message?: string; data?: VerifiedTransaction } | null;
  if (!response.ok || !payload?.status || !payload.data) throw new Error(payload?.message || "Unable to verify payment with Paystack.");
  return payload.data;
}

function safeHexEqual(expectedHex: string, receivedHex: string) {
  if (!/^[0-9a-f]{128}$/i.test(receivedHex)) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const received = Buffer.from(receivedHex, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function verifyPaystackWebhookSignature(rawBody: Buffer, headers: Headers) {
  const modern = headers.get("paystack-signature");
  if (modern) {
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!webhookSecret) return false;
    const fields = modern.split(",").map((part) => part.trim());
    const timestamp = fields.find((part) => part.startsWith("t="))?.slice(2);
    const timestampNumber = Number(timestamp);
    if (!timestamp || !Number.isInteger(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;
    const signedValues = fields.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
    const expected = createHmac("sha512", webhookSecret).update(`${timestamp}.`).update(rawBody).digest("hex");
    return signedValues.some((value) => safeHexEqual(expected, value.split(":").at(-1) ?? ""));
  }
  const legacy = headers.get("x-paystack-signature");
  if (!legacy) return false;
  const expected = createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  return safeHexEqual(expected, legacy);
}

export async function markOrderPaid(reference: string, verified: VerifiedTransaction) {
  if (verified.status !== "success" || verified.reference !== reference || verified.currency !== "NGN") return false;

  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.paymentReference, reference)).limit(1).for("update");
    if (!order) return false;
    const expectedAmount = amountToKobo(order.total);
    if (verified.amount !== expectedAmount) return false;
    if (order.customerEmail && verified.customer?.email && order.customerEmail.toLowerCase() !== verified.customer.email.toLowerCase()) return false;
    if (order.paymentStatus === "paid") return true;
    if (order.paymentStatus !== "pending" && order.paymentStatus !== "expired") return false;

    let inventoryIssue = false;
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    if (!items.length) return false;
    if (order.inventoryReserved) {
      inventoryIssue = items.some((item) => !item.productId);
    } else {
      const reserved: Array<{ productId: string; quantity: number }> = [];
      for (const item of items) {
        if (!item.productId) { inventoryIssue = true; break; }
        const [row] = await tx.update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
          .where(and(eq(products.id, item.productId), gte(products.stockQuantity, item.quantity)))
          .returning({ id: products.id });
        if (!row) { inventoryIssue = true; break; }
        reserved.push({ productId: item.productId, quantity: item.quantity });
      }
      if (inventoryIssue) {
        for (const item of reserved) {
          await tx.update(products).set({ stockQuantity: sql`${products.stockQuantity} + ${item.quantity}` })
            .where(eq(products.id, item.productId));
        }
      }
    }
    await tx.update(orders).set({ status: "paid", paymentStatus: "paid", inventoryReserved: false, inventoryIssue, paidAt: new Date() })
      .where(eq(orders.id, order.id));
    return true;
  });
}

export async function releaseOrderReservation(orderId: string, reason = "failed") {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1).for("update");
    if (!order || !order.inventoryReserved || order.paymentStatus === "paid") return false;
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (!item.productId) continue;
      await tx.update(products).set({ stockQuantity: sql`${products.stockQuantity} + ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }
    await tx.update(orders).set({ inventoryReserved: false, paymentStatus: reason, status: "failed" })
      .where(and(eq(orders.id, orderId), eq(orders.inventoryReserved, true)));
    return true;
  });
}

export async function processPaystackWebhookEvent(event: { event?: string; data?: { id?: number | string; reference?: string; status?: string } }) {
  const eventType = event.event;
  const reference = event.data?.reference;
  if (!eventType || !reference) return { accepted: true, processed: false };
  if (eventType !== "charge.success" && eventType !== "charge.failed") return { accepted: true, processed: false };

  const eventId = `${eventType}:${String(event.data?.id ?? reference)}`;
  const [seenEvent] = await db.select({ id: paymentWebhookEvents.id }).from(paymentWebhookEvents)
    .where(eq(paymentWebhookEvents.providerEventId, eventId)).limit(1);
  if (seenEvent) return { accepted: true, processed: false };

  if (eventType === "charge.success") {
    const verified = await verifyPaystackTransaction(reference);
    if (!(await markOrderPaid(reference, verified))) {
      console.warn("Ignoring Paystack success event that does not match a pending Vendora order.", reference);
      return { accepted: true, processed: false };
    }
  } else {
    const verified = await verifyPaystackTransaction(reference);
    if (verified.status === "failed") {
      const [order] = await db.select({ id: orders.id, paymentStatus: orders.paymentStatus })
        .from(orders).where(eq(orders.paymentReference, reference)).limit(1);
      if (order?.paymentStatus === "pending") await releaseOrderReservation(order.id, "failed");
    }
  }

  await db.insert(paymentWebhookEvents).values({ providerEventId: eventId, eventType })
    .onConflictDoNothing({ target: paymentWebhookEvents.providerEventId });
  return { accepted: true, processed: true };
}

export async function expirePendingCheckouts() {
  const expired = await db.select({ id: orders.id }).from(orders)
    .where(and(eq(orders.paymentStatus, "pending"), lt(orders.expiresAt, new Date())))
    .limit(100);
  let released = 0;
  for (const order of expired) if (await releaseOrderReservation(order.id, "expired")) released += 1;
  return released;
}
