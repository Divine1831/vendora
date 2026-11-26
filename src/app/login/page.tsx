"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function LoginPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");const {error}=await createClient().auth.signInWithPassword({email,password});if(error)setMessage(error.message);else router.push("/dashboard");setBusy(false);}
  return <main className="auth-page"><form className="auth-card" onSubmit={submit}><Link className="wordmark" href="/"><span>V</span> VENDORA</Link><span className="eyebrow">WELCOME BACK</span><h1>Log in to Vendora</h1><label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button button-primary" disabled={busy}>{busy?"Signing in…":"Log in"}</button>{message&&<p className="form-message">{message}</p>}<small>New to Vendora? <Link href="/signup">Create an account</Link></small></form></main>;
}
