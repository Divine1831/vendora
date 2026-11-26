import Link from "next/link";
export function Header() {
  return <header className="site-header"><Link href="/" className="wordmark"><span>V</span> VENDORA</Link><nav><a href="#platform">Platform</a><a href="#launch">Launch Studio</a><a href="#pricing">Pricing</a></nav><div className="header-ctas"><Link href="/login">Log in</Link><a className="button button-primary" href="#launch">Get Started</a></div></header>;
}
