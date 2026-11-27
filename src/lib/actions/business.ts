"use server";
import { z } from "zod";
import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses, profiles, products, orders, orderItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const businessInput = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().max(80).optional().default("Other"),
  description: z.string().max(500).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  currency: z.enum(["NGN","USD","GBP","GHS","KES"]).default("NGN")
});
export async function createBusiness(input: unknown) {
  const user = await requireUser();
  const parsed = businessInput.safeParse(input);
  if (!parsed.success) return { error: "Please check your business details." };
  await db.insert(profiles).values({ id: user.id, fullName: user.user_metadata?.full_name ?? null }).onConflictDoNothing();
  const base = slugify(parsed.data.name) || "my-store";
  const slug = `${base}-${user.id.slice(0, 6)}`;
  const [created] = await db.insert(businesses).values({ ownerId: user.id, ...parsed.data, slug }).returning();
  revalidatePath("/dashboard");
  return { business: created };
}
export async function saveProduct(input: unknown) {
  const user = await requireUser();
  const schema = z.object({
    businessId: z.string().uuid(), name: z.string().trim().min(1).max(120),
    description: z.string().max(2000).optional().default(""), price: z.coerce.number().min(0),
    stockQuantity: z.coerce.number().int().min(0), category: z.string().max(80).default("General"),
    imageUrl: z.string().url().optional().or(z.literal("")).default(""), isActive: z.boolean().default(true)
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid product details." };
  const [owned] = await db.select({ id: businesses.id }).from(businesses)
    .where(eq(businesses.ownerId, user.id)).limit(1);
  if (!owned || owned.id !== parsed.data.businessId) return { error: "Workspace not found." };
  await db.insert(products).values({
    ...parsed.data, imageUrl: parsed.data.imageUrl || null, price: String(parsed.data.price)
  });
  revalidatePath("/dashboard");
  return { success: true };
}


const productUpdateInput = z.object({
  productId: z.string().uuid(),
  businessId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  price: z.coerce.number().finite().min(0).max(9999999999),
  stockQuantity: z.coerce.number().int().min(0).max(100000000),
  category: z.string().trim().min(1).max(80).default("General"),
  imageUrl: z.string().url().optional().or(z.literal("")).default(""),
  isActive: z.boolean().default(true)
});

export async function updateProduct(input: unknown) {
  const user = await requireUser();
  const parsed = productUpdateInput.safeParse(input);
  if (!parsed.success) return { error: "Please check the product details and try again." };

  const [owned] = await db.select({ id: businesses.id }).from(businesses)
    .where(eq(businesses.ownerId, user.id)).limit(1);
  if (!owned || owned.id !== parsed.data.businessId) return { error: "Workspace not found." };

  const { productId, businessId, ...values } = parsed.data;
  const [updated] = await db.update(products).set({
    ...values,
    imageUrl: values.imageUrl || null,
    price: values.price.toFixed(2)
  }).where(andProductOwnership(productId, businessId)).returning({ id: products.id });

  if (!updated) return { error: "Product not found in this workspace." };
  revalidatePath("/dashboard");
  revalidatePath(`/store/${(await getBusinessSlug(businessId)) ?? ""}`);
  return { success: true };
}

export async function archiveProduct(input: unknown) {
  const user = await requireUser();
  const parsed = z.object({ productId: z.string().uuid(), businessId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { error: "Invalid product request." };

  const [owned] = await db.select({ id: businesses.id }).from(businesses)
    .where(eq(businesses.ownerId, user.id)).limit(1);
  if (!owned || owned.id !== parsed.data.businessId) return { error: "Workspace not found." };

  const [updated] = await db.update(products).set({ isActive: false })
    .where(andProductOwnership(parsed.data.productId, parsed.data.businessId))
    .returning({ id: products.id });
  if (!updated) return { error: "Product not found in this workspace." };
  revalidatePath("/dashboard");
  const slug = await getBusinessSlug(parsed.data.businessId);
  if (slug) revalidatePath(`/store/${slug}`);
  return { success: true };
}

function andProductOwnership(productId: string, businessId: string) {
  return and(eq(products.id, productId), eq(products.businessId, businessId));
}

async function getBusinessSlug(businessId: string) {
  const [row] = await db.select({ slug: businesses.slug }).from(businesses)
    .where(eq(businesses.id, businessId)).limit(1);
  return row?.slug;
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  const user = await requireUser();
  const orderId = formData.get("orderId");
  const nextStatus = formData.get("status");
  if (typeof orderId !== "string" || typeof nextStatus !== "string" || !["processing", "shipped", "completed"].includes(nextStatus)) {
    throw new Error("Invalid order update.");
  }
  const [owned] = await db.select({ id: businesses.id }).from(businesses)
    .where(eq(businesses.ownerId, user.id)).limit(1);
  if (!owned) throw new Error("Workspace not found.");

  await db.transaction(async (tx) => {
    const [current] = await tx.select({ status: orders.status, inventoryIssue: orders.inventoryIssue }).from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.businessId, owned.id))).limit(1).for("update");
    if (!current) throw new Error("Order not found.");
    const allowed: Record<string, string[]> = { paid: ["processing"], processing: ["shipped"], shipped: ["completed"] };
    if (!allowed[current.status]?.includes(nextStatus)) throw new Error("This order cannot move to that status.");

    if (nextStatus === "processing" && current.inventoryIssue) {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of items) {
        if (!item.productId) throw new Error("A product in this order is no longer available. Review the order before fulfilment.");
        const [reserved] = await tx.update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
          .where(and(eq(products.id, item.productId), gte(products.stockQuantity, item.quantity)))
          .returning({ id: products.id });
        if (!reserved) throw new Error("There is not enough stock to fulfil this paid order. Restock the product and try again.");
      }
      await tx.update(orders).set({ status: "processing", inventoryIssue: false })
        .where(and(eq(orders.id, orderId), eq(orders.businessId, owned.id)));
    } else {
      await tx.update(orders).set({ status: nextStatus as "processing" | "shipped" | "completed" })
        .where(and(eq(orders.id, orderId), eq(orders.businessId, owned.id)));
    }
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
}
