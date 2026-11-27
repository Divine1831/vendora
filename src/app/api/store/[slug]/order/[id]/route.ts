import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, businesses, orderItems } from "@/db/schema";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const [row] = await db.select({ order: orders, business: businesses })
    .from(orders).innerJoin(businesses, eq(orders.businessId, businesses.id))
    .where(eq(orders.id, id)).limit(1);
  if (!row || row.business.slug !== slug) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return NextResponse.json({ id: row.order.id, status: row.order.status, total: row.order.total, currency: row.business.currency, createdAt: row.order.createdAt, items });
}
