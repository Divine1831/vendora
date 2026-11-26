import Link from "next/link";
import { ArrowRight, Boxes, ChartNoAxesCombined, Globe2, ShieldCheck, ShoppingBag, Workflow } from "lucide-react";
import { Header } from "@/components/landing/header";
import { LaunchStudio } from "@/components/landing/launch-studio";
const features = [
  [ShoppingBag,"Your storefront","A polished online shop that feels like your brand."],
  [Boxes,"Commerce operations","Products, stock and orders connected in one workspace."],
  [ChartNoAxesCombined,"Business intelligence","Understand performance and make clearer decisions."],
  [Globe2,"Built to travel","Local currencies and a foundation for cross-border growth."],
  [Workflow,"Connected workflows","Reduce repetitive work as your business grows."],
  [ShieldCheck,"Ownership first","Workspace data is scoped to the signed-in merchant."]
] as const;
export default function Home() {
  return <main className="marketing"><Header/><section className="hero-shell"><div className="hero-copy"><span className="eyebrow">THE COMMERCE OPERATING SYSTEM</span><h1>Run your business.<br/><em>Not a dozen tools.</em></h1><p>One connected home for your storefront, products, orders, customers and the decisions that move your business forward.</p><div className="hero-actions"><a className="button button-primary" href="#launch">Open Launch Studio <ArrowRight size={17}/></a><Link className="button button-quiet" href="/store/demo">Explore demo store</Link></div><div className="hero-proof">Built for ambitious independent businesses · Start free</div></div><div className="hero-art"><div className="dashboard-card"><div className="dash-top"><b>VENDORA / OVERVIEW</b><span>● LIVE WORKSPACE</span></div><h3>Good morning, founder.</h3><p>Your business, in focus.</p><div className="dash-metrics"><div><small>Revenue</small><b>₦2.45m</b><i>↗ 12.8%</i></div><div><small>Orders</small><b>1,284</b><i>↗ 8.2%</i></div><div><small>Products</small><b>86</b><i>In catalogue</i></div></div><div className="chart-visual"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div><div className="dash-bottom"><span>Recent activity</span><b>3 new orders need attention</b></div></div><div className="float-chip">✦ Your store is taking shape</div></div></section>
    <section id="platform" className="feature-section"><div className="section-intro"><span className="eyebrow">ONE CONNECTED PLATFORM</span><h2>Every moving part.<br/><em>Working together.</em></h2><p>Vendora brings the daily work of selling and growing into one clear, calm operating system.</p></div><div className="feature-grid">{features.map(([Icon,title,desc])=><article className="feature-card" key={title}><Icon size={22}/><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
    <LaunchStudio/>
    <section id="pricing" className="pricing-section"><span className="eyebrow">SIMPLE START. ROOM TO GROW.</span><h2>Start free. Grow with clarity.</h2><div className="pricing-panel"><div><b>Early access</b><h3>Free workspace</h3><p>Build your catalogue, explore the dashboard and prepare your storefront before committing to paid tools.</p></div><strong>₦0 <small>/ to start</small></strong><Link className="button button-primary" href="/signup">Create your workspace <ArrowRight size={16}/></Link></div></section>
    <footer className="site-footer"><Link href="/" className="wordmark"><span>V</span> VENDORA</Link><p>Every Business Deserves Its Own Digital World.</p><small>© {new Date().getFullYear()} Vendora</small></footer>
  </main>;
}
