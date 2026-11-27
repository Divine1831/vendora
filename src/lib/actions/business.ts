"use server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses, profiles, products } from "@/db/schema";
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
