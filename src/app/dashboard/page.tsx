import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag, Wallet, Plus, Store, LogOut, ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";
import { money, date } from "@/lib/format";
import { createBusiness } from "@/lib/actions/business";
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
  if (!data.business) return <main className="auth-page"><form action={createWorkspace} className="auth-card"><span className="eyebrow">ONE LAST STEP</span><h1>Create your workspace</h1><p>Tell us a little about the business you want to bring online.</p><label>Business name<input name="name" required minLength={2}/></label><label>Category<select name="category"><option>Fashion & beauty</option><option>Food & drinks</option><option>Electronics</option><option>Home & lifestyle</option><option>Services</option><option>Other</option></select></label><label>Description<textarea name="description" rows={3}/></label><label>Currency<select name="currency"><option value="NGN">NGN — Nigerian naira</option><option value="USD">USD — US dollar</option><option value="GBP">GBP — British pound</option></select></label><button className="button button-primary">Create workspace</button></form></main>;
  const {business,products,orders}=data;
  const revenue=orders.filter(o=>["paid","processing","shipped","completed"].includes(o.status)).reduce((s,o)=>s+Number(o.total),0);
  return <main className="dashboard-page"><aside className="dash-side"><Link className="wordmark" href="/"><span>V</span> VENDORA</Link><small>WORKSPACE</small><a className="side-active" href="/dashboard">Overview</a><a href="#products">Products</a><a href="#orders">Orders</a><a href="#customers">Customers</a><div className="side-bottom"><form action={signOut}><button className="text-button"><LogOut size={16}/> Sign out</button></form></div></aside><section className="dash-main"><header className="dash-header"><div><span className="eyebrow">MERCHANT COMMAND CENTER</span><h1>{business.name}</h1><p>{business.category || "Your business"} · Workspace overview</p></div><Link className="button button-primary" href="#products"><Plus size={16}/> Add products</Link></header><div className="kpi-grid"><article><Wallet/><small>Paid revenue</small><b>{money(revenue,business.currency)}</b></article><article><ShoppingBag/><small>Orders</small><b>{orders.length}</b></article><article><Package/><small>Products</small><b>{products.length}</b></article></div><div className="dash-columns"><section className="data-panel" id="orders"><div className="panel-title"><h2>Recent orders</h2><span>{orders.length} shown</span></div>{orders.length?orders.slice(0,8).map(o=><div className="data-row" key={o.id}><span><b>{o.customerName || "Customer order"}</b><small>{date(o.createdAt)}</small></span><span><b>{money(o.total,business.currency)}</b><small className="status">{o.status}</small></span></div>):<p className="empty-state">Your orders will appear here when customers place them.</p>}</section><section className="data-panel" id="products"><div className="panel-title"><h2>Product catalogue</h2><span>{products.length} items</span></div>{products.length?products.slice(0,8).map(p=><div className="data-row" key={p.id}><span><b>{p.name}</b><small>{p.category} · Stock {p.stockQuantity}</small></span><b>{money(p.price,business.currency)}</b></div>):<p className="empty-state">Your catalogue is ready for its first product.</p>}</section></div><div className="store-share"><Store/><div><b>Your public store</b><small>Share this link when your storefront is ready.</small></div><Link href={`/store/${business.slug}`}><ArrowUpRight size={16}/> Preview</Link></div></section></main>;
}
