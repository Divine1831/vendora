import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL=https://vpwhgczpbhdzsdrweonn.supabase.co
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY=sb_publishable_VsuXzY8mBmAirD7qSrHriQ_rVcOMhC_

export const hasSupabaseConfig = Boolean(url && anonKey && !url.includes("YOUR_PROJECT"));
export const supabase = hasSupabaseConfig ? createClient(url, anonKey) : null;
