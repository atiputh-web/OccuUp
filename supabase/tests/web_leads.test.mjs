// Local test of the web_leads rules with an in-memory Postgres (PGlite).
// Run: npm i @electric-sql/pglite && node supabase/tests/web_leads.test.mjs
// Needs the core migration next to this one (20261022000001_core.sql) for public.is_staff().
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, existsSync } from "node:fs";
const dir = new URL("../migrations/", import.meta.url);
const db = new PGlite(); let pass = 0, fail = 0;
const ok = (n, c) => { c ? pass++ : fail++; console.log((c ? "PASS " : "FAIL ") + n); };
await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth, public to anon, authenticated, service_role; grant execute on function auth.uid() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;`);
const core = new URL("20261022000001_core.sql", dir);
if (existsSync(core)) await db.exec(readFileSync(core, "utf8"));
else await db.exec(`create table public.staff (user_id uuid primary key); create function public.is_staff() returns boolean language sql stable security definer set search_path = '' as $$ select exists (select 1 from public.staff where user_id = (select auth.uid())) $$;`);
await db.exec(readFileSync(new URL("20261030000001_web_leads.sql", dir), "utf8"));
const S = "00000000-0000-0000-0000-0000000000ff", U = "00000000-0000-0000-0000-00000000000a";
await db.exec(`insert into auth.users values ('${S}','s@x'),('${U}','u@x'); insert into public.staff values ('${S}');`);
async function as(who, sql, p = []) {
  await db.exec(who === "anon" ? "set role anon; select set_config('request.jwt.claim.sub','',false);" : `set role authenticated; select set_config('request.jwt.claim.sub','${who}',false);`);
  try { return await db.query(sql, p); } finally { await db.exec("reset role;"); }
}
const denied = async (...a) => { try { await as(...a); return false; } catch { return true; } };
const ins = "insert into public.web_leads (email, hotel_name, lang, source, page) values ($1,$2,'th','site-signup','#/signup')";
ok("public key can submit a lead", !(await denied("anon", ins, ["gm@hotel.co.th", "Kata Resort"])));
ok("public key cannot read leads", await denied("anon", "select * from public.web_leads") || (await as("anon", "select * from public.web_leads")).rows.length === 0);
ok("public key cannot set status", await denied("anon", "insert into public.web_leads (email, status) values ('a@b.co','qualified')"));
ok("public key cannot write notes", await denied("anon", "insert into public.web_leads (email, notes) values ('a@b.co','x')"));
ok("bad email rejected", await denied("anon", ins, ["not-an-email", null]));
ok("long hotel name rejected", await denied("anon", ins, ["a@b.co", "x".repeat(201)]));
ok("signed-in non-staff cannot read", (await as(U, "select * from public.web_leads")).rows.length === 0);
ok("staff can read", (await as(S, "select email from public.web_leads")).rows[0]?.email === "gm@hotel.co.th");
ok("staff can update status", (await as(S, "update public.web_leads set status='contacted'")).affectedRows === 1);
ok("public key cannot delete", await denied("anon", "delete from public.web_leads"));
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
