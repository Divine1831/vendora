"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Store, LayoutDashboard, Sparkles } from "lucide-react";

const themes = {
  Midnight: { bg: "#101827", accent: "#5ee2d0", text: "#f4f7fb" },
  Minimal: { bg: "#f4f1eb", accent: "#252d35", text: "#1c252d" },
  Bloom: { bg: "#241b2b", accent: "#f3a8c5", text: "#fff4fa" },
  Ocean: { bg: "#102638", accent: "#78bdf4", text: "#f2f8ff" }
};
type Mode = "store" | "dashboard" | "demo";
export function LaunchStudio() {
  const [brand, setBrand] = useState("Your brand");
  const [currency, setCurrency] = useState("NGN");
  const [theme, setTheme] = useState<keyof typeof themes>("Midnight");
  const [mode, setMode] = useState<Mode>("store");
  const [launched, setLaunched] = useState(false);
  const colors = themes[theme];
  const symbol = useMemo(() => ({ NGN:"₦", USD:"$", GBP:"£" }[currency] || "₦"), [currency]);
  return <section id="launch" className="launch-wrap">
    <div className="launch-heading"><span className="eyebrow">LIVE LAUNCH STUDIO</span><h2>See your business<br/><em>come to life.</em></h2><p>Shape the first version of your digital business world. Your preview updates as you type.</p></div>
    <div className="studio-grid">
      <div className="studio-controls">
        <label>Brand name<input value={brand} maxLength={36} onChange={e=>setBrand(e.target.value)} placeholder="Your business name"/></label>
        <label>Visual aesthetic<select value={theme} onChange={e=>setTheme(e.target.value as keyof typeof themes)}>{Object.keys(themes).map(t=><option key={t}>{t}</option>)}</select></label>
        <label>Primary currency<select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="NGN">₦ NGN — Naira</option><option value="USD">$ USD — US Dollar</option><option value="GBP">£ GBP — Pound</option></select></label>
        <div className="mode-list"><span className="field-title">Choose your starting mode</span>
          {([{id:"store",title:"Launch Instant Storefront",desc:"Start with a customer-ready shop",icon:Store},{id:"dashboard",title:"Open Merchant Command Center",desc:"Explore your business workspace",icon:LayoutDashboard},{id:"demo",title:"Explore Live Demo Store",desc:"Try a pre-filled sample experience",icon:Sparkles}] as const).map(item=><button key={item.id} className={mode===item.id?"mode-option selected":"mode-option"} onClick={()=>setMode(item.id)}><item.icon size={18}/><span><b>{item.title}</b><small>{item.desc}</small></span>{mode===item.id&&<Check size={17}/>}</button>)}
        </div>
        <Link className="button button-primary launch-button" href={mode==="demo"?"/store/demo":"/signup"} onClick={()=>{setLaunched(true);try{localStorage.setItem("vendora-launch-draft",JSON.stringify({brand,currency,theme,mode}))}catch{}}}>{launched?"Continue":"Create my starting point"} <ArrowRight size={17}/></Link>
        <small className="subtle">No payment required to explore. Create an account when you are ready to save a workspace.</small>
      </div>
      <div className="studio-preview" style={{background:colors.bg,color:colors.text}}>
        <div className="preview-browser"><i/><i/><i/><span>yourbrand.vendora.store</span></div>
        {mode==="dashboard" ? <div className="mock-dashboard"><div className="mock-sidebar"><b>V.</b><span>Overview</span><span>Products</span><span>Orders</span></div><div className="mock-content"><small>YOUR WORKSPACE</small><h3>{brand || "Your brand"}</h3><div className="mock-stats"><b>{symbol}245,000<small>Revenue</small></b><b>128<small>Orders</small></b><b>36<small>Products</small></b></div><div className="mock-chart"><i/><i/><i/><i/><i/><i/><i/></div></div></div> : <div className="mock-store"><div className="mock-store-nav"><b>{brand || "Your brand"}</b><span>Shop　About　Contact</span></div><div className="mock-store-hero"><small>THE NEW COLLECTION</small><h3>Made for<br/>your everyday.</h3><p>Discover pieces you'll love.</p><span style={{background:colors.accent,color:colors.bg}}>EXPLORE COLLECTION</span></div><div className="mock-products"><div/><div/><div/></div></div>}
        <div className="preview-foot"><span>LIVE PREVIEW</span><b style={{color:colors.accent}}>● All changes synced</b></div>
      </div>
    </div>
  </section>;
}
