
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, BarChart3, Box, Check, ChevronDown,
  CircleHelp, CreditCard, Globe2, LayoutDashboard, Menu,
  MessageCircle, Package, Plus, Search, ShieldCheck, ShoppingBag,
  Sparkles, Store, Users, X, Zap, LogOut, LoaderCircle, Trash2
} from "lucide-react";
import { hasSupabaseConfig, supabase } from "./lib/supabase";

const features = [
  { icon: Store, title: "Instant Store", text: "Launch a beautiful storefront with your own products, brand colours and shareable link." },
  { icon: Sparkles, title: "Vendora AI", text: "Give shoppers helpful product answers and get support creating product descriptions." },
  { icon: Package, title: "Smart Stock", text: "Keep product quantities organised and spot items that are running low." },
  { icon: BarChart3, title: "Vendora Insights", text: "Understand orders, sales and popular products with clear business reports." },
  { icon: Users, title: "Customer Passport", text: "Keep customer relationships organised and recognise returning shoppers." },
  { icon: Zap, title: "Business Automations", text: "Reduce repetitive work with helpful notifications and simple workflows." }
];

const money = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

function Brand({ light = false }) {
  return (
    <a className={`brand ${light ? "brand-light" : ""}`} href="#home" aria-label="Vendora home">
      <span className="brand-mark"><span /></span>
      <span>vendora</span>
    </a>
  );
}

function AuthModal({ mode, setMode, onClose, onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();

    if (!supabase) {
      setMessage("Connect Supabase first. Follow the setup instructions in README.md.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });

        if (error) throw error;

        if (data.session) {
          onSignedIn(data.session.user);
        } else {
          setMessage("Account created. Check your email to confirm your account, then sign in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        onSignedIn(data.user);
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="auth-modal">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close">
          <X size={19} />
        </button>

        <Brand />
        <p className="eyebrow">YOUR BUSINESS, CONNECTED</p>
        <h2>{mode === "signup" ? "Create your Vendora account" : "Welcome back"}</h2>
        <p className="muted">
          {mode === "signup"
            ? "Start building your business's digital world."
            : "Sign in to manage your business."}
        </p>

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && (
            <label>
              Your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Divine Okoh"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          <button className="button button-primary full" disabled={busy}>
            {busy && <LoaderCircle className="spin" size={17} />}
            {mode === "signup" ? "Create account" : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>

        {message && <div className="notice">{message}</div>}

        <p className="switch-auth">
          {mode === "signup" ? "Already have an account?" : "New to Vendora?"}
          {" "}
          <button
            onClick={() => {
              setMessage("");
              setMode(mode === "signup" ? "login" : "signup");
            }}
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>

        {!hasSupabaseConfig && (
          <p className="tiny-note">
            Preview mode: authentication becomes active after Supabase setup.
          </p>
        )}
      </section>
    </div>
  );
}

function Landing({ openAuth }) {
  return (
    <div className="landing" id="home">
      <header className="site-header">
        <div className="container nav-wrap">
          <Brand />

          <nav className="desktop-nav">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
          </nav>

          <div className="nav-actions">
            <button className="button button-quiet" onClick={() => openAuth("login")}>
              Sign in
            </button>
            <button className="button button-primary nav-cta" onClick={() => openAuth("signup")}>
              Get started <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="announcement">
              <span className="pulse-dot" />
              A smarter way to run your business
              <ArrowUpRight size={14} />
            </div>

            <h1>Your business.<br /><span>Your digital world.</span></h1>

            <p className="hero-lede">
              Create your online store, manage your customers, understand your sales
              and grow your business with one intelligent platform.
            </p>

            <div className="hero-actions">
              <button className="button button-primary button-large" onClick={() => openAuth("signup")}>
                Create your store <ArrowRight size={18} />
              </button>
              <a className="text-link" href="#features">
                Explore Vendora <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="hero-proof">
              <div className="avatar-stack">
                <i>V</i><i>B</i><i>+</i>
              </div>
              <span>Built for ambitious businesses</span>
              <span className="proof-divider" />
              <span><ShieldCheck size={15} /> Designed with security in mind</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow" />
            <div className="dashboard-window">
              <div className="window-top">
                <div className="window-dots"><i /><i /><i /></div>
                <span>vendora.app / overview</span>
                <div className="window-profile">VD</div>
              </div>

              <div className="mock-dashboard">
                <aside className="mock-sidebar">
                  <div className="mock-logo"><span className="mini-mark" /> vendora</div>
                  <div className="mock-side-active"><LayoutDashboard size={13} /> Overview</div>
                  <div><Store size={13} /> My store</div>
                  <div><Package size={13} /> Products</div>
                  <div><ShoppingBag size={13} /> Orders</div>
                  <div><Users size={13} /> Customers</div>
                  <div><BarChart3 size={13} /> Insights</div>
                  <div className="mock-side-bottom"><CircleHelp size={13} /> Help centre</div>
                </aside>

                <div className="mock-content">
                  <div className="mock-welcome">
                    <div>
                      <small>MONDAY, YOUR BUSINESS AT A GLANCE</small>
                      <h3>Good morning, Alex <span>✦</span></h3>
                    </div>
                    <div className="mock-date">Last 30 days⌄</div>
                  </div>

                  <div className="mock-stats">
                    <div><small>Total sales</small><strong>₦482,500</strong><em>↗ 12.8%</em></div>
                    <div><small>Orders</small><strong>128</strong><em>↗ 8.2%</em></div>
                    <div><small>Customers</small><strong>94</strong><em>↗ 5.4%</em></div>
                  </div>

                  <div className="mock-chart-card">
                    <div className="chart-heading">
                      <b>Sales overview</b>
                      <small>Revenue activity</small>
                    </div>
                    <div className="chart-bars">
                      {[30,48,39,64,50,78,57,90,68,80,59,98,72,86,62,93,73,100,78,88,69,96,76,90].map((h, i) => (
                        <i key={i} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="chart-labels">
                      <span>1 Jun</span><span>10 Jun</span><span>20 Jun</span><span>30 Jun</span>
                    </div>
                  </div>

                  <div className="mock-bottom">
                    <div><small>Top product</small><b>Signature collection</b><span>42 items sold</span></div>
                    <div className="mock-ai">
                      <Sparkles size={15} /><b>Vendora AI</b>
                      <span>Your best-selling category is growing.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-card float-ai">
              <span className="float-icon"><Sparkles size={16} /></span>
              <div><b>Vendora AI</b><small>Always ready to help</small></div>
              <span className="online-dot" />
            </div>

            <div className="floating-card float-stock">
              <span className="stock-icon"><Package size={16} /></span>
              <div><b>Stock updated</b><small>Inventory stays in sync</small></div>
              <Check size={16} className="check-green" />
            </div>
          </div>
        </section>

        <section className="trust-strip">
          <div className="container trust-inner">
            <span>ONE CONNECTED WORKSPACE</span><i />
            <span>BUILT FOR SMALL BUSINESSES</span><i />
            <span>READY TO GROW WITH YOU</span>
          </div>
        </section>

        <section className="section container" id="features">
          <div className="section-heading">
            <p className="eyebrow">THE VENDORA ADVANTAGE</p>
            <h2>Everything your business needs.<br /><span>Nothing holding you back.</span></h2>
            <p>All the essential tools to run and grow your business, brought together in one calm, connected workspace.</p>
          </div>

          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }, i) => (
              <article className="feature-card" key={title}>
                <div className={`feature-icon feature-${i}`}><Icon size={21} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
                <a href="#how">Explore feature <ArrowUpRight size={14} /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="how">
          <div className="container workflow-inner">
            <div className="workflow-copy">
              <p className="eyebrow">SIMPLE BY DESIGN</p>
              <h2>From idea to<br /><span>open for business.</span></h2>
              <p>Getting your business online shouldn't require a technical team. Vendora helps you take the next step with confidence.</p>
              <button className="button button-primary" onClick={() => openAuth("signup")}>
                Start building <ArrowRight size={17} />
              </button>
            </div>

            <div className="steps">
              <div className="step"><span>01</span><div><h3>Create your business</h3><p>Tell us about your brand, what you sell and how customers can reach you.</p></div><Store size={21} /></div>
              <div className="step"><span>02</span><div><h3>Build your digital store</h3><p>Add products, choose your style and publish a store you can share anywhere.</p></div><Globe2 size={21} /></div>
              <div className="step"><span>03</span><div><h3>Manage and grow</h3><p>Keep track of products, orders and customers from your Vendora workspace.</p></div><BarChart3 size={21} /></div>
            </div>
          </div>
        </section>

        <section className="section container" id="about">
          <div className="callout">
            <div>
              <p className="eyebrow">MADE FOR WHAT'S NEXT</p>
              <h2>Your next chapter<br />starts with a better system.</h2>
              <p>Whether you're starting small or ready for your next stage, Vendora gives your business room to grow.</p>
              <button className="button button-primary" onClick={() => openAuth("signup")}>
                Build your digital world <ArrowRight size={17} />
              </button>
            </div>

            <div className="callout-art">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="orbit-core"><span className="brand-mark"><span /></span></div>
              <div className="orbit-tag tag-one"><ShoppingBag size={15} /> Store</div>
              <div className="orbit-tag tag-two"><Sparkles size={15} /> AI</div>
              <div className="orbit-tag tag-three"><BarChart3 size={15} /> Insights</div>
            </div>
          </div>
        </section>

        <section className="section pricing-section" id="pricing">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">SIMPLE, TRANSPARENT PRICING</p>
              <h2>A plan for every<br /><span>stage of your journey.</span></h2>
              <p>Start with the essentials. Upgrade when your business is ready.</p>
            </div>

            <div className="pricing-grid">
              <article className="price-card">
                <p className="plan-name">Free</p>
                <h3>₦0<span>/ month</span></h3>
                <p>Get your business online and organised.</p>
                <ul>
                  <li><Check /> Basic online store</li>
                  <li><Check /> Product catalogue</li>
                  <li><Check /> Basic order management</li>
                  <li><Check /> Business dashboard</li>
                </ul>
                <button className="button button-outline full" onClick={() => openAuth("signup")}>Start for free</button>
              </article>

              <article className="price-card price-featured">
                <div className="popular-label">A GREAT NEXT STEP</div>
                <p className="plan-name">Starter</p>
                <h3>₦2,500<span>/ month</span></h3>
                <p>More tools for a growing business.</p>
                <ul>
                  <li><Check /> Everything in Free</li>
                  <li><Check /> More products</li>
                  <li><Check /> Store customisation</li>
                  <li><Check /> Basic analytics</li>
                  <li><Check /> Customer management</li>
                </ul>
                <button className="button button-primary full" onClick={() => openAuth("signup")}>Choose Starter</button>
              </article>

              <article className="price-card">
                <p className="plan-name">Business</p>
                <h3>₦5,000<span>/ month</span></h3>
                <p>More insight and control as you scale.</p>
                <ul>
                  <li><Check /> Everything in Starter</li>
                  <li><Check /> Advanced analytics</li>
                  <li><Check /> Smart inventory tools</li>
                  <li><Check /> AI assistant allowance</li>
                  <li><Check /> Customer loyalty tools</li>
                </ul>
                <button className="button button-outline full" onClick={() => openAuth("signup")}>Choose Business</button>
              </article>
            </div>

            <p className="pricing-footnote">
              Prices are proposed launch prices and may change after customer testing. Paid plans are not yet activated.
            </p>
          </div>
        </section>

        <section className="faq-section container">
          <div>
            <p className="eyebrow">GOOD QUESTIONS</p>
            <h2>Let's clear<br /><span>things up.</span></h2>
          </div>

          <div className="faq-list">
            <details><summary>What is Vendora? <ChevronDown /></summary><p>Vendora is a business platform designed to bring online stores, product management, orders and business insights into one workspace.</p></details>
            <details><summary>Do I need coding skills? <ChevronDown /></summary><p>No. The goal is to let business owners create and manage a store without writing code.</p></details>
            <details><summary>Can I use Vendora in Nigeria? <ChevronDown /></summary><p>Yes. Vendora is being designed with Nigerian businesses in mind, including naira pricing and future local payment integrations.</p></details>
            <details><summary>Can I start for free? <ChevronDown /></summary><p>The planned Free tier is ₦0. This starter build is a development preview; connect the backend before using it for real customer data.</p></details>
          </div>
        </section>

        <section className="final-cta">
          <div className="container final-cta-inner">
            <p className="eyebrow">YOUR BUSINESS DESERVES THIS</p>
            <h2>Make room for<br /><span>what's possible.</span></h2>
            <p>Build a business that is ready for its next chapter.</p>
            <button className="button button-light" onClick={() => openAuth("signup")}>
              Get started with Vendora <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div><Brand /><p>Every business deserves its own digital world.</p></div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="mailto:hello@vendora.example">Contact</a>
          </div>
          <span>© {new Date().getFullYear()} Vendora. Built for what's next.</span>
        </div>
      </footer>
    </div>
  );
}

function Onboarding({ user, onDone }) {
  const [form, setForm] = useState({
    name: "",
    category: "Fashion & beauty",
    description: "",
    phone: "",
    currency: "NGN"
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const slug = form.name.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data, error } = await supabase.from("businesses").insert({
        owner_id: user.id,
        name: form.name.trim(),
        slug,
        category: form.category,
        description: form.description.trim(),
        phone: form.phone.trim(),
        currency: form.currency
      }).select().single();

      if (error) throw error;
      onDone(data);
    } catch (err) {
      setError(err.message || "Could not create business.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell centered-shell">
      <div className="onboarding-card">
        <Brand />
        <p className="eyebrow">LET'S SET YOU UP</p>
        <h1>Tell us about<br />your business.</h1>
        <p className="muted">We'll use these details to create your business workspace.</p>

        <form onSubmit={submit} className="auth-form">
          <label>
            Business name
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. The Good Store" />
          </label>

          <label>
            Business category
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>Fashion & beauty</option>
              <option>Food & drinks</option>
              <option>Electronics</option>
              <option>Home & lifestyle</option>
              <option>Health & wellness</option>
              <option>Services</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Short description
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does your business offer?" rows="3" />
          </label>

          <label>
            Business phone
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+234..." />
          </label>

          <label>
            Store currency
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
              <option value="NGN">Nigerian naira (NGN)</option>
              <option value="GHS">Ghanaian cedi (GHS)</option>
              <option value="KES">Kenyan shilling (KES)</option>
              <option value="USD">US dollar (USD)</option>
            </select>
          </label>

          {error && <div className="notice">{error}</div>}

          <button className="button button-primary full" disabled={busy}>
            {busy && <LoaderCircle className="spin" />}
            Create my workspace <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user, business, onSignOut }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: ""
  });
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const [{ data: p, error: productError }, { data: o, error: orderError }] =
        await Promise.all([
          supabase.from("products")
            .select("*")
            .eq("business_id", business.id)
            .order("created_at", { ascending: false }),

          supabase.from("orders")
            .select("id,total,status,created_at")
            .eq("business_id", business.id)
            .order("created_at", { ascending: false })
            .limit(8)
        ]);

      if (productError) throw productError;
      if (orderError) throw orderError;

      setProducts(p || []);
      setOrders(o || []);
    } catch (err) {
      setNotice(err.message || "Could not load your workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [business.id]);

  async function addProduct(e) {
    e.preventDefault();

    if (savingProduct) return;

    setSavingProduct(true);
    setNotice("");

    try {
      const { error } = await supabase.from("products").insert({
        business_id: business.id,
        name: productForm.name.trim(),
        price: Number(productForm.price),
        stock_quantity: Number(productForm.stock || 0),
        description: productForm.description.trim(),
        is_active: true
      });

      if (error) throw error;

      setProductForm({
        name: "",
        price: "",
        stock: "",
        description: ""
      });

      setShowAdd(false);
      setNotice("Product added successfully.");
      await load();
    } catch (err) {
      setNotice(err.message || "Could not add product.");
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;

    const { error } = await supabase.from("products")
      .delete()
      .eq("id", id)
      .eq("business_id", business.id);

    setNotice(error ? error.message : "Product deleted successfully.");

    if (!error) await load();
  }

  const filtered = useMemo(
    () => products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ),
    [products, search]
  );

  const totalSales = orders
    .filter(o => o.status === "paid" || o.status === "completed")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          aria-label="Close navigation"
        />
      )}

      <aside className={`app-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="mobile-sidebar-heading">
          <Brand />
          <button
            className="icon-button mobile-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <div className="side-link side-active" onClick={closeMobileMenu}>
          <LayoutDashboard /> Overview
        </div>

        <div className="side-link" onClick={closeMobileMenu}>
          <Store /> My store <span className="soon">SOON</span>
        </div>

        <div className="side-link" onClick={closeMobileMenu}>
          <Package /> Products
        </div>

        <div className="side-link" onClick={closeMobileMenu}>
          <ShoppingBag /> Orders
        </div>

        <div className="side-link" onClick={closeMobileMenu}>
          <Users /> Customers <span className="soon">SOON</span>
        </div>

        <div className="side-link" onClick={closeMobileMenu}>
          <BarChart3 /> Insights <span className="soon">SOON</span>
        </div>

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="user-avatar">
              {(user.email || "V")[0].toUpperCase()}
            </div>
            <div>
              <b>{user.email}</b>
              <small>{business.name}</small>
            </div>
          </div>

          <button className="side-link logout" onClick={onSignOut}>
            <LogOut /> Sign out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-top">
          <div className="dashboard-heading-group">
            <button
              className="icon-button mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={21} />
            </button>

            <div>
              <span className="muted small">BUSINESS WORKSPACE</span>
              <h2>Overview</h2>
            </div>
          </div>

          <div className="top-right">
            <span className="status-pill"><i /> Workspace active</span>
            <div className="user-avatar">
              {(user.email || "V")[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
              <h1>Welcome to Vendora<span>.</span></h1>
              <p className="muted">Here's what's happening with {business.name}.</p>
            </div>

            <button className="button button-primary" onClick={() => setShowAdd(true)}>
              <Plus size={17} /> Add product
            </button>
          </div>

          {notice && (
            <div className="notice notice-inline">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss message">
                <X size={15} />
              </button>
            </div>
          )}

          <div className="metric-grid">
            <div className="metric-card">
              <span>Total products</span>
              <strong>{products.length}</strong>
              <small><Package /> In your catalogue</small>
            </div>

            <div className="metric-card">
              <span>Recent orders</span>
              <strong>{orders.length}</strong>
              <small><ShoppingBag /> Latest 8 orders</small>
            </div>

            <div className="metric-card">
              <span>Recorded sales</span>
              <strong>{money(totalSales)}</strong>
              <small><BarChart3 /> Paid/completed orders</small>
            </div>

            <div className="metric-card">
              <span>Low stock</span>
              <strong>{products.filter(p => p.stock_quantity <= 5).length}</strong>
              <small><Box /> 5 units or fewer</small>
            </div>
          </div>

          <section className="panel products-panel">
            <div className="panel-heading">
              <div>
                <h3>Product catalogue</h3>
                <p>Manage the products in your business.</p>
              </div>

              <div className="panel-actions">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products"
                  />
                </div>

                <button
                  className="button button-primary button-small"
                  onClick={() => setShowAdd(true)}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <LoaderCircle className="spin" /> Loading your products...
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Package /></div>
                <h4>{search ? "No matching products" : "Your catalogue is ready"}</h4>
                <p>
                  {search
                    ? "Try another search term."
                    : "Add your first product to start building your store catalogue."}
                </p>

                {!search && (
                  <button className="button button-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={16} /> Add your first product
                  </button>
                )}
              </div>
            ) : (
              <div className="product-table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id}>
                        <td data-label="Product">
                          <div className="product-name">
                            <div className="product-placeholder">
                              <Package size={17} />
                            </div>
                            <div>
                              <b>{p.name}</b>
                              <small>{p.description || "No description"}</small>
                            </div>
                          </div>
                        </td>

                        <td data-label="Price">{money(p.price)}</td>
                        <td data-label="Stock">{p.stock_quantity}</td>

                        <td data-label="Status">
                          <span className={`stock-status ${p.stock_quantity <= 5 ? "stock-low" : ""}`}>
                            {p.stock_quantity <= 0
                              ? "Out of stock"
                              : p.stock_quantity <= 5
                                ? "Low stock"
                                : "In stock"}
                          </span>
                        </td>

                        <td data-label="Action">
                          <button
                            className="icon-button delete-button"
                            onClick={() => deleteProduct(p.id)}
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel orders-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent orders</h3>
                <p>New orders will appear here when checkout is connected.</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="orders-empty">
                No orders yet. Your order activity will show here.
              </div>
            ) : (
              <div className="order-list">
                {orders.map(o => (
                  <div className="order-row" key={o.id}>
                    <span className="order-id">#{o.id.slice(0, 8)}</span>
                    <span>{new Date(o.created_at).toLocaleDateString()}</span>
                    <b>{money(o.total)}</b>
                    <span className="stock-status">{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="dashboard-disclaimer">
            <ShieldCheck size={15} />
            Your workspace is private. Keep account credentials secure.
          </p>
        </div>
      </main>

      {showAdd && (
        <div
          className="modal-backdrop"
          onMouseDown={e => e.target === e.currentTarget && setShowAdd(false)}
        >
          <section className="auth-modal add-modal">
            <button
              className="icon-button modal-close"
              onClick={() => setShowAdd(false)}
              aria-label="Close"
            >
              <X />
            </button>

            <p className="eyebrow">YOUR CATALOGUE</p>
            <h2>Add a product</h2>

            <form className="auth-form" onSubmit={addProduct}>
              <label>
                Product name
                <input
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                />
              </label>

              <label>
                Price (₦)
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={productForm.price}
                  onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                />
              </label>

              <label>
                Stock quantity
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.stock}
                  onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                />
              </label>

              <label>
                Description
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                />
              </label>

              <button className="button button-primary full" disabled={savingProduct}>
                {savingProduct
                  ? <LoaderCircle className="spin" size={17} />
                  : <Plus size={16} />}
                {savingProduct ? "Saving product..." : "Save product"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function findBusiness() {
      if (!user) {
        setBusiness(null);
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();

      if (error) console.error(error);

      setBusiness(data || null);
      setChecking(false);
    }

    if (supabase) {
      findBusiness();
    }
  }, [user]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setBusiness(null);
  }

  if (checking) {
    return (
      <div className="boot-screen">
        <Brand />
        <LoaderCircle className="spin" />
        Preparing your workspace...
      </div>
    );
  }

  if (user && supabase && !business) {
    return <Onboarding user={user} onDone={setBusiness} />;
  }

  if (user && business && supabase) {
    return <Dashboard user={user} business={business} onSignOut={signOut} />;
  }

  return (
    <>
      <Landing openAuth={setAuthMode} />
      {authMode && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthMode(null)}
          onSignedIn={setUser}
        />
      )}
    </>
  );
}
