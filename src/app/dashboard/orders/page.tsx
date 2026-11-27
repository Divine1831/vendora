import Link from "next/link";
import { and, desc, eq, ilike, or, inArray } from "drizzle-orm";
import { ArrowLeft, Search } from "lucide-react";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getBusinessForOwner } from "@/lib/queries";
import { date, money } from "@/lib/format";
import { updateOrderStatus } from "@/lib/actions/business";

export const dynamic = "force-dynamic";

export default async function MerchantOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const business = await getBusinessForOwner(user.id);
  if (!business) return <main className="auth-page"><section className="auth-card"><h1>Create your store first</h1><Link href="/dashboard">Go to workspace</Link></section></main>;

  const search = q.trim().slice(0, 100);
  const filters = [eq(orders.businessId, business.id)];
  if (search) filters.push(or(ilike(orders.customerName, `%${search}%`), ilike(orders.customerEmail, `%${search}%`), ilike(orders.paymentReference, `%${search}%`))!);
  const rows = await db.select().from(orders).where(and(...filters)).orderBy(desc(orders.createdAt)).limit(100);
  const ids = rows.map((row) => row.id);
  const items = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];

  return <main className="dashboard-page"><aside className="dash-side"><Link className="wordmark" href="/"><span>V</span> VENDORA</Link><small>WORKSPACE</small><Link href="/dashboard">Overview</Link><Link className="side-active" href="/dashboard/orders">Orders</Link><Link href="/dashboard#products">Products</Link><div className="side-bottom"><Link className="text-button" href="/account/orders">Customer account</Link></div></aside>
    <section className="dash-main"><header className="dash-header"><div><Link className="orders-back-link" href="/dashboard"><ArrowLeft size={14}/> Workspace overview</Link><span className="eyebrow">FULFILMENT WORKSPACE</span><h1>Orders</h1><p>Review payments, items and fulfilment progress.</p></div></header>
      <form className="orders-search" method="get"><Search size={16}/><input name="q" defaultValue={search} placeholder="Search customer, email or payment reference"/><button type="submit">Search</button></form>
      <div className="merchant-orders-list">{rows.length ? rows.map((order) => {
        const nextStatus = order.status === "paid" ? "processing" : order.status === "processing" ? "shipped" : order.status === "shipped" ? "completed" : null;
        const orderLines = items.filter((item) => item.orderId === order.id);
        return <article className="merchant-order-card" key={order.id}><header><div><small>ORDER {order.id.slice(0, 8).toUpperCase()}</small><h2>{order.customerName || "Guest customer"}</h2><p>{order.customerEmail || "No email supplied"} · {date(order.createdAt)}</p></div><div className="merchant-order-amount"><b>{money(order.total, business.currency)}</b><span>{order.status}</span></div></header>
          <div className="merchant-order-items">{orderLines.map((item) => <div key={item.id}><span>{item.productName} × {item.quantity}</span><b>{money(Number(item.unitPrice) * item.quantity, business.currency)}</b></div>)}</div>
          {(order.shippingAddress || order.shippingPhone) && <div className="merchant-shipping-details"><b>Delivery destination</b><span>{order.shippingAddress}</span><span>{[order.shippingCity, order.shippingState, order.shippingPostalCode, order.shippingCountry].filter(Boolean).join(", ")}</span><span>{order.shippingPhone}</span></div>}
          {order.trackingNumber && <div className="merchant-tracking-details"><b>{order.trackingCarrier || "Carrier"} · {order.trackingNumber}</b>{order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer">Open tracking ↗</a>}</div>}
          <footer><div><span className="payment-state">Payment: {order.paymentStatus}</span>{order.paymentReference && <small>Reference {order.paymentReference}</small>}{order.inventoryIssue && <strong className="inventory-review">Stock review required before fulfilment</strong>}</div>
            {nextStatus === "shipped" ? <form className="merchant-ship-form" action={updateOrderStatus}><input type="hidden" name="orderId" value={order.id}/><input type="hidden" name="status" value="shipped"/><input name="trackingCarrier" required maxLength={80} placeholder="Carrier (e.g. GIG Logistics)"/><input name="trackingNumber" required maxLength={120} placeholder="Tracking number"/><input name="trackingUrl" type="url" placeholder="HTTPS tracking link (optional)"/><button type="submit">Mark shipped</button></form> : nextStatus && <form action={updateOrderStatus}><input type="hidden" name="orderId" value={order.id}/><input type="hidden" name="status" value={nextStatus}/><button type="submit">Mark {nextStatus}</button></form>}
          </footer>
        </article>;
      }) : <div className="account-empty"><h2>No matching orders</h2><p>Try another search, or check back after a customer places an order.</p></div>}</div>
    </section>
  </main>;
}
