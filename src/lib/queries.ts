import { and, desc, eq, inArray, count, sum } from "drizzle-orm";
import { db } from "@/db";
import { businesses, orders, products } from "@/db/schema";

export async function getBusinessForOwner(ownerId: string) {
  const [business] = await db.select().from(businesses).where(eq(businesses.ownerId, ownerId)).limit(1);
  return business ?? null;
}

export async function getDashboardData(ownerId: string) {
  const business = await getBusinessForOwner(ownerId);
  if (!business) return { business: null, products: [], orders: [], metrics: { totalOrders: 0, totalProducts: 0, paidRevenue: "0" } };

  const [productRows, orderRows, productCountRows, orderCountRows, revenueRows] = await Promise.all([
    db.select().from(products).where(eq(products.businessId, business.id)).orderBy(desc(products.createdAt)).limit(100),
    db.select().from(orders).where(eq(orders.businessId, business.id)).orderBy(desc(orders.createdAt)).limit(8),
    db.select({ value: count() }).from(products).where(eq(products.businessId, business.id)),
    db.select({ value: count() }).from(orders).where(eq(orders.businessId, business.id)),
    db.select({ value: sum(orders.total) }).from(orders).where(and(
      eq(orders.businessId, business.id),
      inArray(orders.status, ["paid", "processing", "shipped", "completed"])
    ))
  ]);

  return {
    business,
    products: productRows,
    orders: orderRows,
    metrics: {
      totalOrders: orderCountRows[0]?.value ?? 0,
      totalProducts: productCountRows[0]?.value ?? 0,
      paidRevenue: revenueRows[0]?.value ?? "0"
    }
  };
}

export async function getPublicStore(slug: string) {
  const [business] = await db.select({
    id: businesses.id, name: businesses.name, slug: businesses.slug, category: businesses.category,
    description: businesses.description, currency: businesses.currency
  }).from(businesses).where(eq(businesses.slug, slug)).limit(1);
  if (!business) return null;
  const items = await db.select().from(products).where(and(eq(products.businessId, business.id), eq(products.isActive, true))).orderBy(desc(products.createdAt));
  return { business, products: items };
}
