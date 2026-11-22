import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList,
  CreditCard, ExternalLink, Eye, Filter, Globe2, ImagePlus, LayoutDashboard,
  LoaderCircle, LogOut, Menu, MoreHorizontal, Package, Pencil, Plus, Search,
  Settings, ShieldCheck, ShoppingBag, Sparkles, Store, Trash2, TrendingUp,
  Users, Wallet, X, Boxes, SlidersHorizontal
} from "lucide-react";
import { hasSupabaseConfig, supabase } from "./lib/supabase";

const money = (value, currency = "NGN") => new Intl.NumberFormat("en-NG", {
  style: "currency", currency: currency || "NGN", maximumFractionDigits: 0
}).format(Number(value || 0));

const dateLabel = value => value ? new Date(value).toLocaleDateString("en-NG", {
  day: "numeric", month: "short", year: "numeric"
}) : "—";

const initials = value => (value || "V").trim().split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase();

function Brand({ compact = false }) {
  return <a className={`brand ${compact ? "brand-compact" : ""}`} href="/" aria-label="Vendora home">
    <span className="brand-symbol"><span /></span><span className="brand-word">vendora</span>
  </a>;
}

function IconButton({ label, children, onClick, className = "" }) {
  return <button className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

function Button({ children, variant = "primary", size = "", ...props }) {
  return <button className={`button button-${variant} ${size ? `button-${size}` : ""}`} {...props}>{children}</button>;
}

function AuthModal({ mode, setMode, onClose, onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!supabase) return setMessage("Supabase is not configured. Add your Vercel environment variables.");
    setBusy(true); setMessage("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        if (data.session) onSignedIn(data.session.user);
        else setMessage("Your account has been created. Check your email to confirm it, then sign in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSignedIn(data.user);
      }
    } catch (error) {
      setMessage(error.message || "We couldn't complete that request.");
    } finally { setBusy(false); }
  }

  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="auth-modal">
      <IconButton label="Close" className="modal-close" onClick={onClose}><X size={19} /></IconButton>
      <Brand />
      <div className="auth-heading">
        <span className="eyebrow">YOUR BUSINESS, IN GOOD COMPANY</span>
        <h2>{mode === "signup" ? "Build your business home." : "Welcome back."}</h2>
        <p>{mode === "signup" ? "Create your account and bring your business online." : "Sign in to continue to your Vendora workspace."}</p>
      </div>
      <form className="form-stack" onSubmit={submit}>
        {mode === "signup" && <label>Full name<input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required /></label>}
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required /></label>
        <label>Password<input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required /></label>
        <Button disabled={busy}>{busy ? <LoaderCircle className="spin" size={17}/> : null}{mode === "signup" ? "Create account" : "Sign in"}<ArrowRight size={17}/></Button>
      </form>
      {message && <div className="notice">{message}</div>}
      <p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New to Vendora?"} <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }}>{mode === "signup" ? "Sign in" : "Create an account"}</button></p>
    </section>
  </div>;
}

function Landing({ openAuth }) {
  const highlights = [
    [Store, "Your own online store", "Give your products a beautiful home and share your store with customers."],
    [Boxes, "Inventory that stays clear", "Know what you have, what is moving and what needs attention."],
    [ChartIcon, "Business insights", "See your orders and sales activity in one calm, useful workspace."],
    [Users, "Customer relationships", "Keep customer and order information organised as you grow."]
  ];
  return <div className="marketing">
    <header className="marketing-header">
      <div className="marketing-nav shell">
        <Brand />
        <nav><a href="#platform">Platform</a><a href="#how">How it works</a><a href="#pricing">Pricing</a></nav>
        <div className="header-actions"><button className="text-button" onClick={() => openAuth("login")}>Log in</button><Button size="small" onClick={() => openAuth("signup")}>Get started <ArrowUpRight size={16}/></Button></div>
      </div>
    </header>
    <main>
      <section className="hero shell">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="live-dot"/> THE BUSINESS OPERATING SPACE <span className="kicker-line"/></div>
          <h1>Make your business<br/><em>impossible to ignore.</em></h1>
          <p className="hero-description">Your store, products, orders and business insights — brought together in one beautifully simple workspace.</p>
          <div className="hero-buttons"><Button size="large" onClick={() => openAuth("signup")}>Create your free workspace <ArrowRight size={18}/></Button><a href="#platform" className="quiet-link">Explore the platform <ArrowDownRight size={17}/></a></div>
          <div className="hero-proof"><span><ShieldCheck size={15}/> Built for growing businesses</span><span className="proof-separator"/><span><Globe2 size={15}/> Made for a connected world</span></div>
        </div>
        <div className="hero-product">
          <div className="hero-orb orb-a"/><div className="hero-orb orb-b"/>
          <div className="preview-window">
            <div className="preview-top"><div className="window-dots"><i/><i/><i/></div><span>vendora / workspace</span><div className="preview-avatar">V</div></div>
            <div className="preview-body">
              <aside className="preview-sidebar"><Brand compact/><div className="preview-nav active"><LayoutDashboard/>Overview</div><div className="preview-nav"><Package/>Products</div><div className="preview-nav"><ShoppingBag/>Orders</div><div className="preview-nav"><Users/>Customers</div><div className="preview-nav"><BarChart3/>Insights</div><div className="preview-sidebar-bottom">YOUR BUSINESS, IN FOCUS</div></aside>
              <div className="preview-main"><div className="preview-welcome"><div><small>MONDAY, 22 NOVEMBER</small><b>Your business at a glance</b></div><span>Last 30 days⌄</span></div>
                <div className="preview-kpis"><div><small>Revenue</small><b>₦2.48m</b><em>↗ 12.8%</em></div><div><small>Orders</small><b>1,284</b><em>↗ 8.2%</em></div><div><small>Products</small><b>86</b><em>In catalogue</em></div></div>
                <div className="preview-chart"><div className="preview-chart-title"><b>Sales overview</b><span>Revenue activity</span></div><div className="chart-bars">{[28,42,35,58,46,70,51,82,61,75,57,93,69,84,63,97,75,89,66,96,73,86,68,100].map((n,i)=><i key={i} style={{height:`${n}%`}}/>)}</div><div className="chart-axis"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div></div>
                <div className="preview-lower"><div><small>Store status</small><b><i/> Your store is ready</b></div><div><small>Inventory health</small><b>Looking good <span>↗</span></b></div></div>
              </div>
            </div>
          </div>
          <div className="float-note note-one"><span className="note-icon"><Package size={16}/></span><div><b>Inventory updated</b><small>Your catalogue is in sync</small></div><Check size={16}/></div>
          <div className="float-note note-two"><span className="note-icon violet"><Sparkles size={16}/></span><div><b>One clear workspace</b><small>Less busywork. More progress.</small></div></div>
        </div>
      </section>
      <section className="trust-row"><div className="shell"><span>ONE HOME FOR YOUR BUSINESS</span><i/><span>BUILT TO GROW WITH YOU</span><i/><span>LESS ADMIN, MORE MOMENTUM</span></div></section>
      <section className="section shell" id="platform"><div className="section-intro"><span className="eyebrow">THE VENDORA PLATFORM</span><h2>Everything connected.<br/><em>Nothing complicated.</em></h2><p>Run the important parts of your business from one thoughtful place — without the clutter.</p></div>
        <div className="feature-grid">{highlights.map(([Icon,title,description],i)=><article className="feature-card" key={title}><div className={`feature-icon tone-${i}`}><Icon size={21}/></div><h3>{title}</h3><p>{description}</p><span className="feature-number">0{i+1}</span></article>)}</div>
      </section>
      <section className="statement-band" id="how"><div className="shell statement-inner"><div><span className="eyebrow">A BETTER WAY TO WORK</span><h2>Start simple.<br/><em>Grow without limits.</em></h2><p>Set up your business once. Then manage products, keep an eye on orders and share your storefront whenever you're ready.</p><Button onClick={() => openAuth("signup")}>Build your workspace <ArrowRight size={17}/></Button></div><div className="steps-list"><div><b>01</b><span><strong>Create your business</strong><small>Add your business details and make your workspace yours.</small></span><Store/></div><div><b>02</b><span><strong>Add your products</strong><small>Organise your catalogue, prices, images and stock.</small></span><Package/></div><div><b>03</b><span><strong>Open your store</strong><small>Share your store link and start connecting with customers.</small></span><Globe2/></div></div></div></section>
      <section className="section shell pricing-section" id="pricing"><div className="section-intro"><span className="eyebrow">STRAIGHTFORWARD BY DESIGN</span><h2>A clear place to <em>begin.</em></h2><p>Start with the essentials. More advanced services can be introduced as the platform grows.</p></div><div className="pricing-card"><div><span className="plan-tag">EARLY ACCESS</span><h3>Vendora Starter</h3><p>Everything you need to organise your business and build your first catalogue.</p></div><div className="pricing-price">Free <small>during early access</small></div><ul><li><Check/> Business workspace</li><li><Check/> Product catalogue</li><li><Check/> Inventory overview</li><li><Check/> Shareable storefront foundation</li></ul><Button onClick={() => openAuth("signup")}>Get started for free <ArrowRight size={17}/></Button></div></section>
      <section className="closing-cta"><div className="shell"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Give your business<br/><em>room to become.</em></h2><p>Make the everyday work of running your business feel a little more effortless.</p><Button variant="light" onClick={() => openAuth("signup")}>Create your Vendora account <ArrowRight size={17}/></Button></div></section>
    </main>
    <footer className="marketing-footer"><div className="shell footer-content"><div><Brand/><p>Every business deserves a better way to grow.</p></div><div className="footer-links"><a href="#platform">Platform</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="mailto:hello@vendora.example">Contact</a></div><span>© {new Date().getFullYear()} Vendora</span></div></footer>
  </div>;
}

function ChartIcon(props) { return <BarChart3 {...props}/>; }

function Onboarding({ user, onDone }) {
  const [form,setForm] = useState({name:"",category:"Fashion & beauty",description:"",phone:"",currency:"NGN"});
  const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    const slug = form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    try {
      const {data,error} = await supabase.from("businesses").insert({owner_id:user.id,name:form.name.trim(),slug,category:form.category,description:form.description.trim(),phone:form.phone.trim(),currency:form.currency}).select().single();
      if(error) throw error; onDone(data);
    } catch(err) { setError(err.message || "Unable to create your business."); }
    finally { setBusy(false); }
  }
  return <div className="onboarding-screen"><div className="onboarding-panel"><Brand/><span className="eyebrow">LET'S MAKE IT YOURS</span><h1>First, tell us<br/><em>about your business.</em></h1><p>We'll use these details to set up your Vendora workspace.</p><form className="form-stack" onSubmit={submit}>
    <label>Business name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. The Good Store"/></label>
    <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{["Fashion & beauty","Food & drinks","Electronics","Home & lifestyle","Health & wellness","Services","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Business description<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What do you offer?"/></label>
    <label>Business phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+234..."/></label>
    <label>Currency<select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}><option value="NGN">Nigerian naira (NGN)</option><option value="GHS">Ghanaian cedi (GHS)</option><option value="KES">Kenyan shilling (KES)</option><option value="USD">US dollar (USD)</option></select></label>
    {error&&<div className="notice">{error}</div>}<Button disabled={busy}>{busy?<LoaderCircle className="spin"/>:null}Create workspace <ArrowRight size={17}/></Button>
  </form></div></div>;
}

const navItems = [
  {id:"overview",label:"Overview",icon:LayoutDashboard,group:"WORKSPACE"},
  {id:"products",label:"Products",icon:Package,group:"WORKSPACE"},
  {id:"orders",label:"Orders",icon:ShoppingBag,group:"WORKSPACE"},
  {id:"customers",label:"Customers",icon:Users,group:"WORKSPACE"},
  {id:"analytics",label:"Analytics",icon:BarChart3,group:"INSIGHTS"},
  {id:"settings",label:"Settings",icon:Settings,group:"PREFERENCES"}
];

function Dashboard({user,business,onSignOut}) {
  const [section,setSection] = useState("overview");
  const [mobileOpen,setMobileOpen] = useState(false);
  const [products,setProducts] = useState([]);
  const [orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(true);
  const [notice,setNotice] = useState("");
  const [query,setQuery] = useState("");
  const [statusFilter,setStatusFilter] = useState("all");
  const [modal,setModal] = useState(false);
  const [editing,setEditing] = useState(null);
  const [saving,setSaving] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [form,setForm] = useState({name:"",description:"",price:"",stock_quantity:"0",category:"General",image_url:"",is_active:true});
  const [settings,setSettings] = useState({name:business.name||"",category:business.category||"",description:business.description||"",phone:business.phone||"",currency:business.currency||"NGN"});
  const [savingSettings,setSavingSettings] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p,o] = await Promise.all([
        supabase.from("products").select("*").eq("business_id",business.id).order("created_at",{ascending:false}),
        supabase.from("orders").select("id,total,status,created_at,customer_name,customer_email").eq("business_id",business.id).order("created_at",{ascending:false}).limit(100)
      ]);
      if(p.error) throw p.error; if(o.error) throw o.error;
      setProducts(p.data||[]); setOrders(o.data||[]);
    } catch(err) { setNotice(err.message||"Could not load workspace data."); }
    finally { setLoading(false); }
  }
  useEffect(()=>{load();},[business.id]);

  const customers = useMemo(()=>{
    const map = new Map();
    orders.forEach(o=>{
      const key=(o.customer_email||o.customer_name||"Unknown customer").toLowerCase();
      if(!map.has(key)) map.set(key,{name:o.customer_name||"Customer",email:o.customer_email||"No email",orders:0,total:0,last:o.created_at});
      const item=map.get(key); item.orders+=1; item.total+=Number(o.total||0);
      if(new Date(o.created_at)>new Date(item.last)) item.last=o.created_at;
    });
    return [...map.values()].sort((a,b)=>b.total-a.total);
  },[orders]);

  const filteredProducts = useMemo(()=>products.filter(p=>{
    const matches=(p.name+" "+(p.category||"")).toLowerCase().includes(query.toLowerCase());
    return matches && (statusFilter==="all" || (statusFilter==="low" ? Number(p.stock_quantity)<=5 : statusFilter==="active" ? p.is_active!==false : p.is_active===false));
  }),[products,query,statusFilter]);

  const paidOrders = orders.filter(o=>["paid","processing","shipped","completed"].includes(o.status));
  const revenue = paidOrders.reduce((sum,o)=>sum+Number(o.total||0),0);
  const lowStock = products.filter(p=>Number(p.stock_quantity)<=5);
  const averageOrder = paidOrders.length ? revenue/paidOrders.length : 0;
  const recentDays = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i)); d.setHours(0,0,0,0);
    const next=new Date(d); next.setDate(next.getDate()+1);
    const total=paidOrders.filter(o=>new Date(o.created_at)>=d&&new Date(o.created_at)<next).reduce((s,o)=>s+Number(o.total||0),0);
    return {label:d.toLocaleDateString("en",{weekday:"short"}),total};
  });
  const maxDay=Math.max(1,...recentDays.map(d=>d.total));

  function openProduct(product=null) {
    setEditing(product);
    setForm(product?{name:product.name||"",description:product.description||"",price:String(product.price??""),stock_quantity:String(product.stock_quantity??0),category:product.category||"General",image_url:product.image_url||"",is_active:product.is_active!==false}:{name:"",description:"",price:"",stock_quantity:"0",category:"General",image_url:"",is_active:true});
    setModal(true);
  }

  async function uploadImage(file) {
    if(!file) return;
    if(!file.type.startsWith("image/")) { setNotice("Please select an image file."); return; }
    if(file.size>5*1024*1024) { setNotice("Please choose an image smaller than 5 MB."); return; }
    setUploading(true); setNotice("");
    try {
      const ext=file.name.split(".").pop()?.toLowerCase()||"jpg";
      const path=`${user.id}/${business.id}/${crypto.randomUUID()}.${ext}`;
      const {error}=await supabase.storage.from("products").upload(path,file,{upsert:false,contentType:file.type});
      if(error) throw error;
      const {data}=supabase.storage.from("products").getPublicUrl(path);
      setForm(f=>({...f,image_url:data.publicUrl}));
    } catch(err) { setNotice(err.message||"Image upload failed. Check the products storage bucket and policies."); }
    finally { setUploading(false); }
  }

  async function saveProduct(e) {
    e.preventDefault(); if(saving) return;
    setSaving(true); setNotice("");
    const payload={business_id:business.id,name:form.name.trim(),description:form.description.trim(),price:Number(form.price),stock_quantity:Number(form.stock_quantity||0),category:form.category.trim()||"General",image_url:form.image_url||null,is_active:form.is_active};
    try {
      const result=editing
        ? await supabase.from("products").update(payload).eq("id",editing.id).eq("business_id",business.id)
        : await supabase.from("products").insert(payload);
      if(result.error) throw result.error;
      setModal(false); setNotice(editing?"Product updated successfully.":"Product added successfully."); await load();
    } catch(err) { setNotice(err.message||"Could not save product."); }
    finally { setSaving(false); }
  }

  async function removeProduct(product) {
    if(!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const {error}=await supabase.from("products").delete().eq("id",product.id).eq("business_id",business.id);
    if(error) setNotice(error.message); else {setNotice("Product deleted."); await load();}
  }

  async function updateOrder(order,status) {
    const {error}=await supabase.from("orders").update({status}).eq("id",order.id).eq("business_id",business.id);
    if(error) setNotice(error.message); else {setNotice(`Order status updated to ${status}.`); await load();}
  }

  async function saveBusiness(e) {
    e.preventDefault(); setSavingSettings(true); setNotice("");
    try {
      const {data,error}=await supabase.from("businesses").update({name:settings.name.trim(),category:settings.category,description:settings.description.trim(),phone:settings.phone.trim(),currency:settings.currency}).eq("id",business.id).select().single();
      if(error) throw error;
      setNotice("Business settings saved."); window.location.reload();
    } catch(err) {setNotice(err.message||"Could not save settings.");}
    finally {setSavingSettings(false);}
  }

  const storeUrl=`${window.location.origin}/store/${business.slug}`;
  const sidebar = <aside className={`app-sidebar ${mobileOpen?"sidebar-open":""}`}>
    <div className="sidebar-brand"><Brand/><IconButton label="Close menu" className="mobile-close" onClick={()=>setMobileOpen(false)}><X/></IconButton></div>
    <div className="workspace-switch"><span className="workspace-avatar">{initials(business.name)}</span><span><small>YOUR WORKSPACE</small><b>{business.name}</b></span><ChevronDown size={15}/></div>
    {["WORKSPACE","INSIGHTS","PREFERENCES"].map(group=><div className="nav-group" key={group}><span className="nav-group-label">{group}</span>{navItems.filter(n=>n.group===group).map(n=><button key={n.id} className={`nav-item ${section===n.id?"nav-item-active":""}`} onClick={()=>{setSection(n.id);setMobileOpen(false);}}><n.icon size={18}/><span>{n.label}</span>{n.id==="orders"&&orders.filter(o=>o.status==="pending").length>0&&<i className="nav-count">{orders.filter(o=>o.status==="pending").length}</i>}</button>)}</div>)}
    <div className="sidebar-bottom"><a className="sidebar-help" href="mailto:hello@vendora.example"><CircleHelp size={17}/> Help & support <ArrowUpRight size={14}/></a><div className="sidebar-user"><span className="user-avatar">{initials(user.email)}</span><span className="user-meta"><b>{user.email}</b><small>{business.name}</small></span><button onClick={onSignOut} aria-label="Sign out" title="Sign out"><LogOut size={17}/></button></div></div>
  </aside>;

  return <div className="dashboard-shell">
    {mobileOpen&&<button className="sidebar-scrim" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"/>}
    {sidebar}
    <main className="dashboard-main">
      <header className="dashboard-header"><div className="header-left"><IconButton label="Open navigation" className="mobile-menu" onClick={()=>setMobileOpen(true)}><Menu/></IconButton><div><span className="header-overline">BUSINESS WORKSPACE</span><h1>{navItems.find(n=>n.id===section)?.label||"Overview"}</h1></div></div><div className="header-right"><a className="store-link" href={storeUrl} target="_blank" rel="noreferrer"><Globe2 size={16}/> View store <ExternalLink size={13}/></a><span className="header-divider"/><span className="header-date">{new Date().toLocaleDateString("en-NG",{weekday:"short",day:"numeric",month:"short"})}</span><span className="user-avatar">{initials(user.email)}</span></div></header>
      <div className="dashboard-content">
        {notice&&<div className="dashboard-notice"><span>{notice}</span><button onClick={()=>setNotice("")}><X size={15}/></button></div>}
        {loading?<div className="loading-panel"><LoaderCircle className="spin"/> Preparing your workspace...</div>:<>
          {section==="overview"&&<Overview business={business} products={products} orders={orders} revenue={revenue} averageOrder={averageOrder} lowStock={lowStock} recentDays={recentDays} maxDay={maxDay} setSection={setSection} openProduct={openProduct}/>}
          {section==="products"&&<Products products={filteredProducts} currency={business.currency} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} openProduct={openProduct} removeProduct={removeProduct}/>}
          {section==="orders"&&<Orders orders={orders} updateOrder={updateOrder} currency={business.currency}/>}
          {section==="customers"&&<Customers customers={customers} currency={business.currency}/>}
          {section==="analytics"&&<Analytics orders={orders} products={products} revenue={revenue} recentDays={recentDays} maxDay={maxDay} currency={business.currency}/>}
          {section==="settings"&&<SettingsPanel business={business} settings={settings} setSettings={setSettings} saveBusiness={saveBusiness} saving={savingSettings} storeUrl={storeUrl}/>}
        </>}
      </div>
    </main>
    {modal&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&!saving&&setModal(false)}><section className="product-modal"><div className="modal-heading"><div><span className="eyebrow">{editing?"UPDATE CATALOGUE":"GROW YOUR CATALOGUE"}</span><h2>{editing?"Edit product":"Add a product"}</h2><p>Give customers the details they need to choose.</p></div><IconButton label="Close" onClick={()=>setModal(false)}><X/></IconButton></div>
      <form className="form-stack" onSubmit={saveProduct}>
        <div className="image-upload"><div className="upload-preview">{form.image_url?<img src={form.image_url} alt="Product preview"/>:<ImagePlus size={26}/>}</div><div><b>Product image</b><small>JPG, PNG or WEBP · Up to 5 MB</small><label className="upload-button">{uploading?<LoaderCircle className="spin"/>:"Choose image"}<input type="file" accept="image/*" onChange={e=>uploadImage(e.target.files?.[0])} hidden/></label></div></div>
        <label>Product name<input required maxLength={120} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Classic everyday bag"/></label>
        <div className="form-two"><label>Price ({business.currency||"NGN"})<input type="number" min="0" step="0.01" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Stock quantity<input type="number" min="0" step="1" required value={form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})}/></label></div>
        <label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="e.g. Accessories"/></label>
        <label>Description<textarea rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the product..."/></label>
        <label className="switch-line"><span><b>Visible in catalogue</b><small>Customers can see active products in your public store.</small></span><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/></label>
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={()=>setModal(false)}>Cancel</Button><Button disabled={saving||uploading}>{saving?<LoaderCircle className="spin"/>:null}{editing?"Save changes":"Add product"}<ArrowRight size={16}/></Button></div>
      </form>
    </section></div>}
  </div>;
}

function PageHeading({eyebrow,title,description,action}) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

function Overview({business,products,orders,revenue,averageOrder,lowStock,recentDays,maxDay,setSection,openProduct}) {
  const pending=orders.filter(o=>o.status==="pending").length;
  const metrics=[
    {label:"Gross revenue",value:money(revenue,business.currency),hint:"Paid and fulfilled orders",icon:Wallet,tone:"violet"},
    {label:"Total orders",value:orders.length.toLocaleString(),hint:`${pending} awaiting attention`,icon:ShoppingBag,tone:"blue"},
    {label:"Products listed",value:products.length.toLocaleString(),hint:"Across your catalogue",icon:Package,tone:"green"},
    {label:"Average order",value:money(averageOrder,business.currency),hint:"Based on paid orders",icon:TrendingUp,tone:"amber"}
  ];
  return <><div className="welcome-banner"><div><span className="eyebrow">YOUR BUSINESS, IN FOCUS</span><h2>Good to see you again.</h2><p>Here's a clear look at what's happening with <b>{business.name}</b>.</p></div><div className="welcome-actions"><Button variant="soft" onClick={()=>setSection("products")}><Package size={16}/> Manage products</Button><Button onClick={()=>openProduct()}><Plus size={17}/> Add product</Button></div></div>
    <div className="metric-grid">{metrics.map(({label,value,hint,icon:Icon,tone})=><article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>)}</div>
    <div className="overview-grid"><section className="panel revenue-panel"><div className="panel-heading"><div><h3>Revenue activity</h3><p>Daily paid and fulfilled order totals · Last 7 days</p></div><span className="panel-badge"><Activity size={14}/> Live from orders</span></div><div className="revenue-total">{money(revenue,business.currency)}<small>Recorded revenue</small></div><div className="bar-chart">{recentDays.map((d,i)=><div className="bar-column" key={d.label}><div className="bar-track"><i style={{height:`${Math.max(4,d.total/maxDay*100)}%`}}/></div><span>{d.label}</span></div>)}</div></section>
      <section className="panel inventory-panel"><div className="panel-heading"><div><h3>Inventory health</h3><p>Products that need attention</p></div><button className="link-button" onClick={()=>setSection("products")}>View all <ArrowRight size={14}/></button></div><div className="inventory-number">{lowStock.length}<span>low-stock items</span></div>{lowStock.length?lowStock.slice(0,4).map(p=><div className="inventory-item" key={p.id}><span className="inventory-product"><span className="mini-product">{p.image_url?<img src={p.image_url} alt=""/>:<Package size={15}/>}</span><b>{p.name}</b></span><span className={`stock-tag ${Number(p.stock_quantity)===0?"stock-out":""}`}>{p.stock_quantity} left</span></div>):<div className="healthy-state"><span><Check size={17}/></span><b>Everything looks healthy</b><small>No low-stock products right now.</small></div>}</section></div>
    <section className="panel recent-panel"><div className="panel-heading"><div><h3>Recent orders</h3><p>Your latest customer activity</p></div><button className="link-button" onClick={()=>setSection("orders")}>All orders <ArrowRight size={14}/></button></div>{orders.length?<div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{orders.slice(0,5).map(o=><tr key={o.id}><td className="order-code">#{o.id.slice(0,8).toUpperCase()}</td><td>{o.customer_name||"Customer"}</td><td>{dateLabel(o.created_at)}</td><td className="amount-cell">{money(o.total,business.currency)}</td><td><StatusPill status={o.status}/></td></tr>)}</tbody></table></div>:<EmptyState icon={ShoppingBag} title="Your orders will appear here" text="Once customers place orders, you'll see activity and order details in this space."/>}</section>
  </>;
}

function StatusPill({status}) {
  const s=(status||"pending").toLowerCase();
  return <span className={`status-pill status-${s}`}>{s.replace("_"," ")}</span>;
}

function EmptyState({icon:Icon,title,text,action}) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={22}/></span><h3>{title}</h3><p>{text}</p>{action}</div>;
}

function Products({products,currency,query,setQuery,statusFilter,setStatusFilter,openProduct,removeProduct}) {
  return <><PageHeading eyebrow="YOUR CATALOGUE" title="Products" description="Manage your products, prices, images and stock." action={<Button onClick={()=>openProduct()}><Plus size={17}/> Add product</Button>}/>
    <section className="panel"><div className="toolbar"><div className="search-field"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products or categories..."/></div><div className="filter-field"><SlidersHorizontal size={16}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All products</option><option value="active">Active</option><option value="inactive">Hidden</option><option value="low">Low stock</option></select></div><span className="result-count">{products.length} products</span></div>
      {products.length?<div className="product-grid">{products.map(p=><article className="product-card" key={p.id}><div className="product-visual">{p.image_url?<img src={p.image_url} alt={p.name}/>:<div className="product-placeholder"><Package size={30}/></div>}<span className={`product-visibility ${p.is_active===false?"hidden-product":""}`}>{p.is_active===false?"Hidden":"Active"}</span><div className="product-actions"><button title="Edit product" onClick={()=>openProduct(p)}><Pencil size={15}/></button><button title="Delete product" onClick={()=>removeProduct(p)}><Trash2 size={15}/></button></div></div><div className="product-card-info"><span className="product-category">{p.category||"General"}</span><h3>{p.name}</h3><div className="product-card-bottom"><b>{money(p.price,currency)}</b><span className={Number(p.stock_quantity)<=5?"stock-warning":""}>{p.stock_quantity} in stock</span></div></div></article>)}</div>:<EmptyState icon={Package} title="No products found" text={query?"Try another search or clear the filter.":"Add your first product to start building your catalogue."} action={<Button onClick={()=>openProduct()}><Plus size={16}/> Add a product</Button>}/>}</section>
  </>;
}

function Orders({orders,updateOrder,currency}) {
  const [filter,setFilter]=useState("all");
  const visible=orders.filter(o=>filter==="all"||o.status===filter);
  return <><PageHeading eyebrow="CUSTOMER ACTIVITY" title="Orders" description="Review customer orders and keep their status up to date."/><section className="panel"><div className="toolbar"><div className="filter-field"><Filter size={16}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option>{["pending","paid","processing","shipped","completed","cancelled","failed"].map(s=><option key={s}>{s}</option>)}</select></div><span className="result-count">{visible.length} orders</span></div>{visible.length?<div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>EMAIL</th><th>DATE</th><th>TOTAL</th><th>STATUS</th><th>UPDATE STATUS</th></tr></thead><tbody>{visible.map(o=><tr key={o.id}><td className="order-code">#{o.id.slice(0,8).toUpperCase()}</td><td>{o.customer_name||"Customer"}</td><td>{o.customer_email||"—"}</td><td>{dateLabel(o.created_at)}</td><td className="amount-cell">{money(o.total,currency)}</td><td><StatusPill status={o.status}/></td><td><select className="inline-select" value={o.status} onChange={e=>updateOrder(o,e.target.value)}>{["pending","paid","processing","shipped","completed","cancelled","failed"].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>:<EmptyState icon={ShoppingBag} title="No orders yet" text="Orders will appear here when they are created for your business."/>}</section></>;
}

function Customers({customers,currency}) {
  return <><PageHeading eyebrow="PEOPLE BEHIND THE ORDERS" title="Customers" description="A simple view of the people who have ordered from your business."/><section className="panel">{customers.length?<div className="table-wrap"><table><thead><tr><th>CUSTOMER</th><th>EMAIL</th><th>ORDERS</th><th>ORDER VALUE</th><th>LAST ORDER</th></tr></thead><tbody>{customers.map((c,i)=><tr key={c.email}><td><span className="customer-cell"><span className="customer-avatar">{initials(c.name)}</span><b>{c.name}</b></span></td><td>{c.email}</td><td>{c.orders}</td><td className="amount-cell">{money(c.total,currency)}</td><td>{dateLabel(c.last)}</td></tr>)}</tbody></table></div>:<EmptyState icon={Users} title="Your customer list is waiting" text="Customers will be collected from your business orders. No customer records are available yet."/>}</section></>;
}

function Analytics({orders,products,revenue,recentDays,maxDay,currency}) {
  const paid=orders.filter(o=>["paid","processing","shipped","completed"].includes(o.status));
  const best=[...products].sort((a,b)=>Number(b.stock_quantity)-Number(a.stock_quantity)).slice(0,5);
  return <><PageHeading eyebrow="KNOW YOUR NUMBERS" title="Analytics" description="A practical snapshot built from the order and product data currently in your workspace."/><div className="metric-grid analytics-metrics"><div className="metric-card"><div className="metric-icon violet"><Wallet/></div><span>Recorded revenue</span><strong>{money(revenue,currency)}</strong><small>Paid and fulfilled orders</small></div><div className="metric-card"><div className="metric-icon blue"><ShoppingBag/></div><span>Paid orders</span><strong>{paid.length}</strong><small>Orders beyond pending</small></div><div className="metric-card"><div className="metric-icon green"><Package/></div><span>Catalogue size</span><strong>{products.length}</strong><small>Products in your account</small></div><div className="metric-card"><div className="metric-icon amber"><Boxes/></div><span>Units in stock</span><strong>{products.reduce((s,p)=>s+Number(p.stock_quantity||0),0)}</strong><small>Current recorded quantity</small></div></div><div className="overview-grid"><section className="panel revenue-panel"><div className="panel-heading"><div><h3>Daily revenue</h3><p>Last seven days · based on recorded orders</p></div></div><div className="bar-chart analytics-chart">{recentDays.map(d=><div className="bar-column" key={d.label}><div className="bar-track"><i style={{height:`${Math.max(4,d.total/maxDay*100)}%`}}/></div><span>{d.label}</span><b>{d.total?money(d.total,currency):"—"}</b></div>)}</div></section><section className="panel inventory-panel"><div className="panel-heading"><div><h3>Product stock overview</h3><p>Largest recorded stock quantities</p></div></div>{best.length?best.map(p=><div className="inventory-item" key={p.id}><span className="inventory-product"><span className="mini-product">{p.image_url?<img src={p.image_url} alt=""/>:<Package size={15}/>}</span><b>{p.name}</b></span><b>{p.stock_quantity} units</b></div>):<p className="muted">Add products to see stock information.</p>}</section></div></>;
}

function SettingsPanel({business,settings,setSettings,saveBusiness,saving,storeUrl}) {
  const [copied,setCopied]=useState(false);
  async function copyLink(){try{await navigator.clipboard.writeText(storeUrl);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setCopied(false);}}
  return <><PageHeading eyebrow="YOUR BUSINESS PROFILE" title="Settings" description="Keep your business details accurate and your storefront ready to share."/><div className="settings-layout"><section className="panel settings-panel"><div className="panel-heading"><div><h3>Business information</h3><p>These details help identify your business across Vendora.</p></div></div><form className="form-stack" onSubmit={saveBusiness}><label>Business name<input required value={settings.name} onChange={e=>setSettings({...settings,name:e.target.value})}/></label><label>Category<input value={settings.category} onChange={e=>setSettings({...settings,category:e.target.value})}/></label><label>Business description<textarea rows="4" value={settings.description} onChange={e=>setSettings({...settings,description:e.target.value})}/></label><div className="form-two"><label>Business phone<input value={settings.phone} onChange={e=>setSettings({...settings,phone:e.target.value})}/></label><label>Currency<select value={settings.currency} onChange={e=>setSettings({...settings,currency:e.target.value})}><option value="NGN">NGN — Nigerian naira</option><option value="GHS">GHS — Ghanaian cedi</option><option value="KES">KES — Kenyan shilling</option><option value="USD">USD — US dollar</option></select></label></div><Button disabled={saving}>{saving?<LoaderCircle className="spin"/>:null}Save changes <Check size={16}/></Button></form></section><section className="panel store-settings"><div className="store-settings-icon"><Globe2 size={22}/></div><span className="eyebrow">YOUR PUBLIC PRESENCE</span><h3>Your store link</h3><p>Share your storefront link with customers. Public storefront access requires the included Supabase migration.</p><div className="copy-field"><span>{storeUrl}</span><button onClick={copyLink}>{copied?<Check size={15}/>:<ClipboardList size={15}/>} {copied?"Copied":"Copy"}</button></div><a href={storeUrl} target="_blank" rel="noreferrer" className="link-button">Open storefront <ExternalLink size={14}/></a></section></div></>;
}

function Storefront({slug}) {
  const [business,setBusiness]=useState(null);
  const [products,setProducts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [query,setQuery]=useState("");
  useEffect(()=>{
    async function loadStore(){
      if(!supabase){setError("Storefront is not connected.");setLoading(false);return;}
      try{
        const {data:b,error:be}=await supabase.from("storefront_businesses").select("*").eq("slug",slug).maybeSingle();
        if(be) throw be;if(!b) throw new Error("This store could not be found or has not been published.");
        const {data:p,error:pe}=await supabase.from("products").select("id,name,description,price,stock_quantity,image_url,category,is_active").eq("business_id",b.id).eq("is_active",true).order("created_at",{ascending:false});
        if(pe) throw pe;setBusiness(b);setProducts(p||[]);
      }catch(err){setError(err.message||"Unable to load this store.");}
      finally{setLoading(false);}
    }
    loadStore();
  },[slug]);
  const visible=products.filter(p=>(p.name+" "+(p.category||"")).toLowerCase().includes(query.toLowerCase()));
  return <div className="public-store"><header className="store-header"><div className="shell"><Brand/><a href="/">Powered by Vendora <ArrowUpRight size={14}/></a></div></header>{loading?<div className="store-message"><LoaderCircle className="spin"/> Loading store...</div>:error?<div className="store-message"><Store size={30}/><h2>Store unavailable</h2><p>{error}</p><a href="/">Visit Vendora</a></div>:<><section className="store-hero"><div className="shell"><span className="eyebrow">{business.category||"INDEPENDENT BUSINESS"}</span><h1>{business.name}</h1><p>{business.description||"Discover products from this store."}</p></div></section><main className="shell store-catalogue"><div className="store-catalogue-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>Explore products</h2></div><div className="search-field"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find something..."/></div></div>{visible.length?<div className="store-product-grid">{visible.map(p=><article className="store-product" key={p.id}><div className="store-product-image">{p.image_url?<img src={p.image_url} alt={p.name}/>:<Package size={32}/>}</div><span>{p.category||"Featured"}</span><h3>{p.name}</h3><p>{p.description||"A thoughtful pick from this collection."}</p><b>{money(p.price,business.currency)}</b><span className="store-stock">{Number(p.stock_quantity)>0?"Available":"Currently unavailable"}</span></article>)}</div>:<EmptyState icon={Package} title="No products to show" text="Try another search or check back later."/>}</main></>}<footer className="marketing-footer store-footer"><div className="shell footer-content"><Brand/><span>Store experience by Vendora</span></div></footer></div>;
}

export default function App() {
  const [user,setUser]=useState(null);
  const [business,setBusiness]=useState(null);
  const [checking,setChecking]=useState(true);
  const [businessChecking,setBusinessChecking]=useState(false);
  const [authMode,setAuthMode]=useState(null);
  const [pathname,setPathname]=useState(window.location.pathname);

  useEffect(()=>{
    const handle=()=>setPathname(window.location.pathname);
    window.addEventListener("popstate",handle);
    return()=>window.removeEventListener("popstate",handle);
  },[]);

  useEffect(()=>{
    if(!supabase){setChecking(false);return;}
    let alive=true;
    supabase.auth.getSession().then(({data})=>{if(alive){setUser(data.session?.user||null);setChecking(false);}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user||null));
    return()=>{alive=false;subscription.unsubscribe();};
  },[]);

  useEffect(()=>{
    async function findBusiness(){
      if(!user){setBusiness(null);setBusinessChecking(false);return;}
      setBusinessChecking(true);
      const {data,error}=await supabase.from("businesses").select("*").eq("owner_id",user.id).limit(1).maybeSingle();
      if(error) console.error("Business lookup:",error.message);
      setBusiness(data||null);
      setBusinessChecking(false);
    }
    if(supabase&&user)findBusiness();
    else if(!user){setBusiness(null);setBusinessChecking(false);}
  },[user]);

  async function signOut(){await supabase.auth.signOut();setUser(null);setBusiness(null);window.history.pushState({},"","/");setPathname("/");}
  const storeMatch=pathname.match(/^\/store\/([^/]+)\/?$/);
  if(storeMatch)return <Storefront slug={decodeURIComponent(storeMatch[1])}/>;
  if(checking || (user && businessChecking))return <div className="boot-screen"><Brand/><LoaderCircle className="spin"/><span>Preparing your Vendora experience...</span></div>;
  if(user&&business)return <Dashboard user={user} business={business} onSignOut={signOut}/>;
  if(user&&!business&&supabase)return <Onboarding user={user} onDone={setBusiness}/>;
  return <><Landing openAuth={setAuthMode}/>{authMode&&<AuthModal mode={authMode} setMode={setAuthMode} onClose={()=>setAuthMode(null)} onSignedIn={setUser}/>}</>;
}
