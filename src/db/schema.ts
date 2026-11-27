import { pgTable, uuid, text, varchar, numeric, integer, boolean, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";

export const orderStatus = pgEnum("order_status", ["pending","paid","processing","shipped","completed","cancelled","failed"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 80 }).notNull(),
  category: text("category"),
  description: text("description"),
  phone: text("phone"),
  currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("businesses_slug_unique").on(t.slug), index("businesses_owner_id_idx").on(t.ownerId)]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("General"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("products_business_id_idx").on(t.businessId)]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").references(() => profiles.id, { onDelete: "set null" }),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  status: orderStatus("status").notNull().default("pending"),
  paymentStatus: varchar("payment_status", { length: 24 }).notNull().default("unpaid"),
  paymentReference: varchar("payment_reference", { length: 100 }),
  paymentAuthorizationUrl: text("payment_authorization_url"),
  idempotencyKey: varchar("idempotency_key", { length: 100 }),
  inventoryReserved: boolean("inventory_reserved").notNull().default(false),
  inventoryIssue: boolean("inventory_issue").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  shippingPhone: varchar("shipping_phone", { length: 30 }),
  shippingAddress: text("shipping_address"),
  shippingCity: varchar("shipping_city", { length: 100 }),
  shippingState: varchar("shipping_state", { length: 100 }),
  shippingPostalCode: varchar("shipping_postal_code", { length: 24 }),
  shippingCountry: varchar("shipping_country", { length: 80 }).notNull().default("Nigeria"),
  trackingCarrier: varchar("tracking_carrier", { length: 80 }),
  trackingNumber: varchar("tracking_number", { length: 120 }),
  trackingUrl: text("tracking_url"),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [
  index("orders_business_id_idx").on(t.businessId),
  index("orders_customer_id_idx").on(t.customerId),
  index("orders_payment_expiry_idx").on(t.paymentStatus, t.expiresAt),
  uniqueIndex("orders_payment_reference_unique").on(t.paymentReference),
  uniqueIndex("orders_idempotency_key_unique").on(t.idempotencyKey)
]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull()
});


export const paymentWebhookEvents = pgTable("payment_webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerEventId: varchar("provider_event_id", { length: 180 }).notNull(),
  eventType: varchar("event_type", { length: 80 }).notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("payment_webhook_events_provider_event_unique").on(t.providerEventId)]);
