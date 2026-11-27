"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function SignupPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");const supabase=createClient();const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/auth/callback`,data:{full_name:email.split("@")[0]}}});setMessage(error?.message??"Account created. Check your email if verification is enabled.");setBusy(false);}
  return <main className="auth-page"><form className="auth-card" onSubmit={submit}><Link className="wordmark" href="/"><span>V</span> VENDORA</Link><span className="eyebrow">YOUR BUSINESS STARTS HERE</span><h1>Create your account</h1><p>Set up your free workspace and bring your business into focus.</p><label>Email address<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button button-primary" disabled={busy}>{busy?"Creating account…":"Create account"}</button>{message&&<p className="form-message">{message}</p>}<small>Already registered? <Link href="/login">Log in</Link></small></form></main>;
}
