import Link from "next/link";
import { ArrowRight, Boxes, ChartNoAxesCombined, Globe2, ShieldCheck, ShoppingBag, Workflow, Store, PackageCheck, BarChart3 } from "lucide-react";
import { Header } from "@/components/landing/header";
import { LaunchStudio } from "@/components/landing/launch-studio";

const features = [
  [ShoppingBag, "Your storefront", "A polished online shop that feels like your brand."],
  [Boxes, "Commerce operations", "Products, stock and orders connected in one workspace."],
  [ChartNoAxesCombined, "Business intelligence", "Understand performance using the records your business actually generates."],
  [Globe2, "Built to travel", "A foundation for local currencies and cross-border growth."],
  [Workflow, "Connected workflows", "Bring everyday selling tasks into one focused workspace."],
  [ShieldCheck, "Ownership first", "Merchant workspace access is protected by signed-in ownership checks."]
] as const;

const steps = [
  [Store, "Create your workspace", "Set up your business profile and choose the details customers will see."],
  [PackageCheck, "Build your catalogue", "Add products, descriptions, prices, stock levels and product imagery."],
  [BarChart3, "Manage your operation", "Review incoming orders and use your recorded business activity to understand performance."]
] as const;

const faqs = [
  ["Can I create a store for free?", "The current workspace offer is free to start. No paid subscription tiers are represented in the current application."],
  ["Can customers pay online today?", "The storefront can start a secure NGN Paystack checkout. Before accepting live payments, the deployment must have Paystack keys, a webhook signing secret and the additive payment migration configured and tested."],
  ["Can I manage products and orders?", "Merchants can manage products and review orders, payment state and fulfilment progress. Paid orders can move through processing, shipped and completed."],
  ["Is my business data private?", "Merchant data access is designed around authenticated ownership and Supabase Row Level Security. Production access policies still need to be verified against the live database before launch."]
] as const;

export default function Home() {
  return (
    <main className="marketing">
      <Header />
      <section className="hero-shell">
        <div className="hero-copy">
          <span className="eyebrow">THE COMMERCE OPERATING SYSTEM</span>
          <h1>Run your business.<br /><em>Not a dozen tools.</em></h1>
          <p>One connected home for your storefront, products, orders and the decisions that move your business forward.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/signup">Build your workspace <ArrowRight size={17} /></Link>
            <Link className="button button-quiet" href="/store/demo">Explore demo store</Link>
          </div>
          <div className="hero-proof">A focused workspace for ambitious independent businesses · Free to start</div>
        </div>
        <div className="hero-art">
          <div className="dashboard-card">
            <div className="dash-top"><b>VENDORA / WORKSPACE</b><span>YOUR BUSINESS, IN FOCUS</span></div>
            <h3>Everything in its place.</h3>
            <p>A clear view of the work behind your business.</p>
            <div className="preview-feature-list">
              <div><span className="preview-icon"><ShoppingBag size={17} /></span><span><b>Orders</b><small>Review and manage customer orders</small></span><ArrowRight size={15} /></div>
              <div><span className="preview-icon"><PackageCheck size={17} /></span><span><b>Products</b><small>Keep your catalogue and stock organized</small></span><ArrowRight size={15} /></div>
              <div><span className="preview-icon"><ChartNoAxesCombined size={17} /></span><span><b>Performance</b><small>Insights based on recorded activity</small></span><ArrowRight size={15} /></div>
            </div>
            <div className="preview-note"><ShieldCheck size={16} /> Your dashboard reflects your own business records.</div>
          </div>
          <div className="float-chip">One workspace. Your way.</div>
        </div>
      </section>

      <section id="platform" className="feature-section">
        <div className="section-intro">
          <span className="eyebrow">ONE CONNECTED PLATFORM</span>
          <h2>Every moving part.<br /><em>Working together.</em></h2>
          <p>Vendora brings the daily work of selling and growing into one clear, calm operating system.</p>
        </div>
        <div className="feature-grid">
          {features.map(([Icon, title, desc]) => <article className="feature-card" key={title}><Icon size={22} /><h3>{title}</h3><p>{desc}</p></article>)}
        </div>
      </section>

      <section id="how-it-works" className="how-section">
        <div className="section-intro">
          <span className="eyebrow">A CLEARER WAY TO SELL</span>
          <h2>From first setup<br /><em>to everyday operations.</em></h2>
          <p>Start with the essentials, then build out your business as your needs grow.</p>
        </div>
        <div className="steps-grid">
          {steps.map(([Icon, title, desc], index) => <article className="step-card" key={title}>
            <span className="step-number">0{index + 1}</span><Icon size={22} /><h3>{title}</h3><p>{desc}</p>
          </article>)}
        </div>
      </section>

      <LaunchStudio />

      <section id="pricing" className="pricing-section">
        <span className="eyebrow">SIMPLE START. ROOM TO GROW.</span>
        <h2>Start free. Grow with clarity.</h2>
        <div className="pricing-panel">
          <div><b>Current offer</b><h3>Free workspace</h3><p>Create your account, set up your business and prepare your product catalogue. Paid plans are not currently advertised because they are not configured in this application.</p></div>
          <strong>₦0 <small>to get started</small></strong>
          <Link className="button button-primary" href="/signup">Create your workspace <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="faq-section">
        <div className="section-intro"><span className="eyebrow">GOOD TO KNOW</span><h2>Frequently asked<br /><em>questions.</em></h2></div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </div>
      </section>

      <footer className="site-footer">
        <Link href="/" className="wordmark"><span>V</span> VENDORA</Link>
        <p>Every Business Deserves Its Own Digital World.</p>
        <small>© {new Date().getFullYear()} Vendora</small>
      </footer>
    </main>
  );
}
