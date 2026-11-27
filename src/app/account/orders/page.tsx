import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { businesses, orderItems, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { date, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const user = await requireUser();
  const rows = await db.select({ order: orders, storeName: businesses.name, storeSlug: businesses.slug, currency: businesses.currency })
    .from(orders).innerJoin(businesses, eq(orders.businessId, businesses.id))
    .where(eq(orders.customerId, user.id)).orderBy(desc(orders.createdAt)).limit(100);
  const ids = rows.map((row) => row.order.id);
  const items = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];

  return <main className="account-page"><header className="account-header"><Link className="wordmark" href="/"><span>V</span> VENDORA</Link><nav><Link href="/account">Account</Link><Link href="/">Shop</Link></nav></header><section className="account-content">
    <span className="eyebrow">YOUR PURCHASES</span><h1>Order history</h1><p className="account-intro">Track purchases made while signed in to this account.</p>
    {!rows.length ? <div className="account-empty"><h2>No orders yet</h2><p>When you complete a purchase while signed in, it will appear here.</p><Link className="button button-primary" href="/">Explore Vendora</Link></div> : <div className="account-order-list">{rows.map(({ order, storeName, storeSlug, currency }) => <article className="account-order" key={order.id}>
      <header><div><small>ORDER {order.id.slice(0, 8).toUpperCase()}</small><h2>{storeName}</h2><span>{date(order.createdAt)}</span></div><div className="account-order-total"><b>{money(order.total, currency)}</b><span className={`order-pill order-${order.status}`}>{order.status}</span></div></header>
      <ul>{items.filter((item) => item.orderId === order.id).map((item) => <li key={item.id}><span>{item.productName} × {item.quantity}</span><b>{money(Number(item.unitPrice) * item.quantity, currency)}</b></li>)}</ul>
      {(order.shippingAddress || order.shippingPhone) && <div className="account-delivery-details"><b>Delivery address</b><span>{order.shippingAddress}</span><span>{[order.shippingCity, order.shippingState, order.shippingPostalCode, order.shippingCountry].filter(Boolean).join(", ")}</span><span>{order.shippingPhone}</span></div>}
      {order.trackingNumber && <div className="account-tracking"><span><b>{order.trackingCarrier || "Delivery"}</b> · {order.trackingNumber}</span>{order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer">Track parcel ↗</a>}</div>}
      <footer><span>Payment: {order.paymentStatus}</span><Link href={`/store/${storeSlug}`}>Visit store ↗</Link></footer>
    </article>)}</div>}
  </section></main>;
}
