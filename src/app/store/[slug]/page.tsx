import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicStore } from "@/lib/queries";
import { money } from "@/lib/format";
export default async function StorePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const data=await getPublicStore(slug); if(!data) notFound();
  return <main className="public-store"><header><Link className="wordmark" href="/"><span>V</span> VENDORA</Link><span>POWERED BY VENDORA</span></header><section className="store-hero"><span className="eyebrow">{data.business.category || "THE COLLECTION"}</span><h1>{data.business.name}</h1><p>{data.business.description || "Discover the collection, curated for you."}</p></section><section className="store-products"><div className="panel-title"><h2>Shop the collection</h2><span>{data.products.length} products</span></div>{data.products.length?<div className="store-grid">{data.products.map(p=><article className="store-product" key={p.id}>{p.imageUrl?<img src={p.imageUrl} alt={p.name}/>:<div className="product-placeholder">V.</div>}<div><h3>{p.name}</h3><p>{p.description}</p><b>{money(p.price,data.business.currency)}</b></div></article>)}</div>:<p className="empty-state">This store is getting ready. Check back soon.</p>}</section></main>;
}
