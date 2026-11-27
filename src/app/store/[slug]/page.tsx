import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicStore } from "@/lib/queries";
import { ShoppingExperience } from "@/components/storefront/shopping-experience";
import { getUser } from "@/lib/auth";
export default async function StorePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const data=await getPublicStore(slug); if(!data) notFound(); const user=await getUser();
  return <main className="public-store"><header><Link className="wordmark" href="/"><span>V</span> VENDORA</Link><nav className="store-header-nav">{user ? <Link href="/account/orders">My orders</Link> : <Link href="/login">Sign in</Link>}<span>POWERED BY VENDORA</span></nav></header><section className="store-hero"><span className="eyebrow">{data.business.category || "THE COLLECTION"}</span><h1>{data.business.name}</h1><p>{data.business.description || "Discover the collection, curated for you."}</p></section><section className="store-products"><div className="panel-title"><div><span className="store-section-kicker">THE EDIT</span><h2>Shop the collection</h2></div><span>{data.products.length} products</span></div>{data.products.length?<ShoppingExperience slug={data.business.slug} currency={data.business.currency} products={data.products} initialCustomerEmail={user?.email ?? ""} initialCustomerName={typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : ""}/>:<p className="empty-state">This store is getting ready. Check back soon.</p>}</section></main>;
}
