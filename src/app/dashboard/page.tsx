import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag, Wallet, Plus, Store, LogOut, ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";
import { money, date } from "@/lib/format";
import { createBusiness, updateOrderStatus } from "@/lib/actions/business";
import { ProductManager } from "@/components/dashboard/product-manager";
import { signOut } from "@/lib/actions/auth";

async function createWorkspace(formData: FormData) {
  "use server";
  const result = await createBusiness({
    name: formData.get("name"), category: formData.get("category"),
    description: formData.get("description"), currency: formData.get("currency")
  });
  if (result.error) throw new Error(result.error);
  redirect("/dashboard");
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  if (!data.business) return <main className="auth-page"><form action={createWorkspace} className="auth-card"><span className="eyebrow">ONE LAST STEP</span><h1>Create your workspace</h1><p>Tell us a little about the business you want to bring online.</p><label>Business name<input name="name" required minLength={2}/></label><label>Category<select name="category"><option>Fashion & beauty</option><option>Food & drinks</option><option>Electronics</option><option>Home & lifestyle</option><option>Services</option><option>Other</option></select></label><label>Description<textarea name="description" rows={3}/></label><label>Currency<select name="currency"><option value="NGN">NGN — Nigerian naira</option><option value="USD">USD — US dollar (Paystack checkout unavailable)</option><option value="GBP">GBP — British pound (Paystack checkout unavailable)</option></select></label><button className="button button-primary">Create workspace</button></form></main>;

  const { business, products, orders, metrics } = data;
  return <main className="dashboard-page"><aside className="dash-side"><Link className="wordmark" href="/"><span>V</span> VENDORA</Link><small>WORKSPACE</small><a className="side-active" href="/dashboard">Overview</a><a href="#products">Products</a><Link href="/dashboard/orders">Orders</Link><Link href="/account/orders">Customer account</Link><div className="side-bottom"><form action={signOut}><button className="text-button"><LogOut size={16}/> Sign out</button></form></div></aside><section className="dash-main">
    <header className="dash-header"><div><span className="eyebrow">MERCHANT COMMAND CENTER</span><h1>{business.name}</h1><p>{business.category || "Your business"} · Workspace overview</p></div><Link className="button button-primary" href="#products"><Plus size={16}/> Manage products</Link></header>
    <div className="kpi-grid"><article><Wallet/><small>Paid revenue</small><b>{money(metrics.paidRevenue, business.currency)}</b></article><article><ShoppingBag/><small>Orders</small><b>{metrics.totalOrders}</b></article><article><Package/><small>Products</small><b>{metrics.totalProducts}</b></article></div>
    <div className="dash-columns"><section className="data-panel" id="orders"><div className="panel-title"><h2>Recent orders</h2><span>Latest 8</span></div>{orders.length ? orders.slice(0, 8).map((order) => {
      const nextStatus = order.status === "paid" ? "processing" : order.status === "processing" ? "shipped" : order.status === "shipped" ? "completed" : null;
      return <article className="merchant-order-row" key={order.id}><div className="merchant-order-main"><span><b>{order.customerName || "Customer order"}</b><small>{order.customerEmail || "No email supplied"} · {date(order.createdAt)}</small></span><span><b>{money(order.total, business.currency)}</b><small className="status">{order.status} · payment {order.paymentStatus}{order.inventoryIssue ? " · stock review required" : ""}</small></span></div>{nextStatus && <form action={updateOrderStatus} className="order-status-form"><input type="hidden" name="orderId" value={order.id}/><input type="hidden" name="status" value={nextStatus}/><button type="submit">Mark {nextStatus}</button></form>}</article>;
    }) : <p className="empty-state">Paid and pending customer orders will appear here after checkout.</p>}</section></div>
    <ProductManager businessId={business.id} currency={business.currency} initialProducts={products}/>
    <div className="store-share"><Store/><div><b>Your public store</b><small>Share this link when your storefront is ready.</small></div><Link href={`/store/${business.slug}`}><ArrowUpRight size={16}/> Preview</Link></div>
  </section></main>;
}
