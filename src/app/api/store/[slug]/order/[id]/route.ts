import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, businesses, orderItems } from "@/db/schema";
import { getUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in to view this order." }, { status: 401 });

  const [row] = await db.select({ order: orders, business: businesses })
    .from(orders).innerJoin(businesses, eq(orders.businessId, businesses.id))
    .where(and(eq(orders.id, id), eq(businesses.slug, slug))).limit(1);
  if (!row || (row.order.customerId !== user.id && row.business.ownerId !== user.id)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return NextResponse.json({ id: row.order.id, status: row.order.status, paymentStatus: row.order.paymentStatus, total: row.order.total, currency: row.business.currency, createdAt: row.order.createdAt, items });
}
