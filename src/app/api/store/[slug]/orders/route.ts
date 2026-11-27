import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { businesses, products, orders, orderItems, profiles } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { amountToKobo, createPaymentReference, expirePendingCheckouts, initializePaystackTransaction, releaseOrderReservation } from "@/lib/payments/paystack";

const inputSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.string().trim().email().max(200).transform((value) => value.toLowerCase()),
  idempotencyKey: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1).max(30).refine((items) => new Set(items.map((item) => item.productId)).size === items.length, "Duplicate products are not allowed.")
});

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Check your name, email and cart quantities." }, { status: 400 });

  const user = await getUser();
  const customerEmail = user?.email?.toLowerCase() ?? parsed.data.customerEmail;
  if (user && customerEmail !== parsed.data.customerEmail) {
    return NextResponse.json({ error: "Use the email address linked to your signed-in account." }, { status: 403 });
  }

  const [business] = await db.select({ id: businesses.id, currency: businesses.currency, name: businesses.name })
    .from(businesses).where(eq(businesses.slug, slug)).limit(1);
  if (!business) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  if (business.currency !== "NGN") return NextResponse.json({ error: "Paystack checkout is currently available for NGN stores only." }, { status: 409 });

  await expirePendingCheckouts();
  const [existingOrder] = await db.select().from(orders).where(and(
    eq(orders.idempotencyKey, parsed.data.idempotencyKey), eq(orders.businessId, business.id)
  )).limit(1);
  if (existingOrder) {
    if (existingOrder.paymentStatus === "pending" && existingOrder.expiresAt && existingOrder.expiresAt > new Date()) {
      if (existingOrder.paymentAuthorizationUrl) {
        return NextResponse.json({ orderId: existingOrder.id, total: Number(existingOrder.total), currency: "NGN", authorizationUrl: existingOrder.paymentAuthorizationUrl }, { status: 200 });
      }
      return NextResponse.json({ pending: true, message: "Your secure checkout is being prepared. Please try again in a moment." }, { status: 202 });
    }
    return NextResponse.json({ error: existingOrder.paymentStatus === "paid" ? "This checkout has already been paid. Check your order history." : "This checkout has expired. Please start checkout again." }, { status: 409 });
  }

  const paymentReference = createPaymentReference();
  let createdOrder: { orderId: string; total: string };
  try {
    if (user) {
      await db.insert(profiles).values({ id: user.id, fullName: parsed.data.customerName }).onConflictDoUpdate({
        target: profiles.id, set: { fullName: parsed.data.customerName }
      });
    }

    createdOrder = await db.transaction(async (tx) => {
      const productRows = await tx.select().from(products).where(and(
        eq(products.businessId, business.id), eq(products.isActive, true),
        inArray(products.id, parsed.data.items.map((item) => item.productId))
      ));
      if (productRows.length !== parsed.data.items.length) throw new Error("UNAVAILABLE");

      const selected = parsed.data.items.map((item) => {
        const product = productRows.find((row) => row.id === item.productId);
        if (!product) throw new Error("UNAVAILABLE");
        try { return { product, quantity: item.quantity, priceKobo: amountToKobo(product.price) }; }
        catch { throw new Error("PRICE"); }
      });

      // Reserve inventory atomically so concurrent checkouts cannot oversell the same stock.
      for (const { product, quantity } of selected) {
        const [reserved] = await tx.update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${quantity}` })
          .where(and(eq(products.id, product.id), eq(products.businessId, business.id), gte(products.stockQuantity, quantity)))
          .returning({ id: products.id });
        if (!reserved) throw new Error("STOCK");
      }

      const totalKobo = selected.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0);
      if (!Number.isSafeInteger(totalKobo) || totalKobo < 1) throw new Error("TOTAL");
      const total = (totalKobo / 100).toFixed(2);
      const [order] = await tx.insert(orders).values({
        businessId: business.id,
        customerId: user?.id ?? null,
        customerName: parsed.data.customerName,
        customerEmail,
        total,
        status: "pending",
        paymentStatus: "pending",
        paymentReference,
        idempotencyKey: parsed.data.idempotencyKey,
        inventoryReserved: true,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }).returning({ id: orders.id });
      await tx.insert(orderItems).values(selected.map(({ product, quantity }) => ({
        orderId: order.id, productId: product.id, productName: product.name, quantity, unitPrice: product.price
      })));
      return { orderId: order.id, total };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK") return NextResponse.json({ error: "One or more items no longer have enough stock. Please update your cart." }, { status: 409 });
    if (error instanceof Error && error.message === "UNAVAILABLE") return NextResponse.json({ error: "One or more products are no longer available." }, { status: 409 });
    if (error instanceof Error && error.message === "TOTAL") return NextResponse.json({ error: "The order total is invalid." }, { status: 400 });
    if (error instanceof Error && error.message === "PRICE") return NextResponse.json({ error: "All products in this checkout must have a price greater than ₦0.00." }, { status: 400 });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      const [existing] = await db.select().from(orders).where(eq(orders.idempotencyKey, parsed.data.idempotencyKey)).limit(1);
      if (existing?.paymentAuthorizationUrl) return NextResponse.json({ orderId: existing.id, total: Number(existing.total), currency: "NGN", authorizationUrl: existing.paymentAuthorizationUrl }, { status: 200 });
      if (existing?.paymentStatus === "pending") return NextResponse.json({ pending: true, message: "Your secure checkout is being prepared. Please try again in a moment." }, { status: 202 });
    }
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "We couldn't create your order. Please try again." }, { status: 500 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
    const appOrigin = new URL(appUrl);
    if (appOrigin.protocol !== "https:" && appOrigin.hostname !== "localhost") throw new Error("APP_URL must use HTTPS in production.");
    const callbackUrl = new URL("/checkout/verify", appOrigin);
    callbackUrl.searchParams.set("reference", paymentReference);
    const payment = await initializePaystackTransaction({
      email: customerEmail,
      amountKobo: amountToKobo(createdOrder.total),
      reference: paymentReference,
      callbackUrl: callbackUrl.toString(),
      orderId: createdOrder.orderId,
      businessId: business.id
    });
    await db.update(orders).set({ paymentAuthorizationUrl: payment.authorizationUrl }).where(eq(orders.id, createdOrder.orderId));
    return NextResponse.json({ orderId: createdOrder.orderId, total: Number(createdOrder.total), currency: "NGN", authorizationUrl: payment.authorizationUrl }, { status: 201 });
  } catch (error) {
    await releaseOrderReservation(createdOrder.orderId, "failed").catch((releaseError) => console.error("Inventory release failed", releaseError));
    console.error("Paystack initialization failed", error);
    return NextResponse.json({ error: "We couldn't start the payment. Your reserved items have been released; please try again." }, { status: 502 });
  }
}
