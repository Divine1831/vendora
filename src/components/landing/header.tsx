"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="Vendora home" onClick={() => setOpen(false)}>
        <span>V</span> VENDORA
      </Link>
      <nav className={open ? "site-nav site-nav-open" : "site-nav"} aria-label="Main navigation">
        <a href="#platform" onClick={() => setOpen(false)}>Platform</a>
        <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
        <a href="#launch" onClick={() => setOpen(false)}>Launch Studio</a>
        <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
      </nav>
      <div className="header-ctas">
        <Link href="/login">Log in</Link>
        <Link className="button button-primary" href="/signup">Get Started</Link>
      </div>
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div id="mobile-navigation" className={open ? "mobile-nav mobile-nav-open" : "mobile-nav"}>
        <a href="#platform" onClick={() => setOpen(false)}>Platform</a>
        <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
        <a href="#launch" onClick={() => setOpen(false)}>Launch Studio</a>
        <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
        <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
        <Link href="/signup" onClick={() => setOpen(false)}>Create your workspace</Link>
      </div>
    </header>
  );
}
