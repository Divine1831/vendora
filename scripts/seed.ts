import { db } from "../src/db";
import { profiles, businesses, products } from "../src/db/schema";
import { eq } from "drizzle-orm";

const demoOwner = process.env.DEMO_OWNER_ID;
if (!demoOwner) throw new Error("Set DEMO_OWNER_ID to the UUID of an existing Supabase Auth user before seeding. The seed will not create a fake auth identity.");
await db.insert(profiles).values({ id: demoOwner, fullName: "Vendora Demo" }).onConflictDoNothing();
const [existing] = await db.select().from(businesses).where(eq(businesses.slug, "demo"));
let business = existing;
if (!business) [business] = await db.insert(businesses).values({
  ownerId: demoOwner, name: "Sunday Supply", slug: "demo", category: "Lifestyle",
  description: "Everyday essentials, thoughtfully selected.", currency: "NGN"
}).returning();
const found = await db.select().from(products).where(eq(products.businessId, business.id));
if (!found.length) await db.insert(products).values([
  { businessId: business.id, name: "Everyday tote", price: "18500", stockQuantity: 12, category: "Accessories", description: "A dependable everyday carry." },
  { businessId: business.id, name: "Ceramic pour-over", price: "24000", stockQuantity: 8, category: "Home", description: "A calmer morning ritual." },
  { businessId: business.id, name: "Soft cotton shirt", price: "32000", stockQuantity: 15, category: "Clothing", description: "An easy wardrobe staple." }
]);
console.log("Demo seed complete. Demo business slug: demo");
process.exit(0);
