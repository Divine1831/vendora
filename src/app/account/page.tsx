import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();
  return <main className="auth-page"><section className="auth-card">
    <Link className="wordmark" href="/"><span>V</span> VENDORA</Link>
    <span className="eyebrow">YOUR ACCOUNT</span>
    <h1>Welcome back</h1>
    <p>{user.email}</p>
    <div className="account-links"><Link className="button button-primary" href="/account/orders">View order history</Link><Link className="button button-secondary" href="/">Continue shopping</Link></div>
  </section></main>;
}
