import postgres from "postgres";
import fs from "node:fs/promises";
const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
const migration = await fs.readFile("supabase/migrations/0001_vendora_core.sql", "utf8");
await sql.unsafe(migration);
await sql.end();
console.log("Vendora core migration applied.");
