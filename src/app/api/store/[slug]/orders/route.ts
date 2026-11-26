import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, products, orders, orderItems } from "@/db/schema";

const inputSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.string().email().max(200),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(20) })).min(1).max(30)
});
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
  const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
  if (!business) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  const rows = await db.select().from(products).where(and(eq(products.businessId, business.id), eq(products.isActive, true)));
  const selected = parsed.data.items.map(item => {
    const product = rows.find(p => p.id === item.productId);
    if (!product) return null;
    return { product, quantity: item.quantity };
  });
  if (selected.some(x => !x)) return NextResponse.json({ error: "One or more products are unavailable." }, { status: 400 });
  const total = selected.reduce((sum, x) => sum + Number(x!.product.price) * x!.quantity, 0);
  const [order] = await db.insert(orders).values({
    businessId: business.id, customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail, total: total.toFixed(2), status: "pending"
  }).returning();
  await db.insert(orderItems).values(selected.map(x => ({
    orderId: order.id, productId: x!.product.id, productName: x!.product.name,
    quantity: x!.quantity, unitPrice: x!.product.price
  })));
  return NextResponse.json({ orderId: order.id, status: order.status, total, currency: business.currency }, { status: 201 });
}
