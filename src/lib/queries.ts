import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, orders, products } from "@/db/schema";

export async function getBusinessForOwner(ownerId: string) {
  const [business] = await db.select().from(businesses).where(eq(businesses.ownerId, ownerId)).limit(1);
  return business ?? null;
}
export async function getDashboardData(ownerId: string) {
  const business = await getBusinessForOwner(ownerId);
  if (!business) return { business: null, products: [], orders: [] };
  const [productRows, orderRows] = await Promise.all([
    db.select().from(products).where(eq(products.businessId, business.id)).orderBy(desc(products.createdAt)),
    db.select().from(orders).where(eq(orders.businessId, business.id)).orderBy(desc(orders.createdAt)).limit(100)
  ]);
  return { business, products: productRows, orders: orderRows };
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
