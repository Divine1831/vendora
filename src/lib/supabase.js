
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_https://vpwhgczpbhdzsdrweonn.supabase.co;
const anonKey = import.meta.env.VITE_sb_publishable_VsuXzY8mBmAirD7qSrHriQ_rVcOMhC_;

export const hasSupabaseConfig = Boolean(
  url &&
  anonKey &&
  !url.includes("YOUR_PROJECT")
);

export const supabase = hasSupabaseConfig
  ? createClient(url, anonKey)
  : null;
