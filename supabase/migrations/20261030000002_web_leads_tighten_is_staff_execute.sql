-- Follow-up to 20261030000001_web_leads.sql, applied directly to the live Supabase project
-- (atiputh-web's Project OccuUp, rwfulphqchekqokytxqr) via the Supabase MCP, then copied here so
-- the migration history on disk matches what is actually live.
--
-- Supabase's security advisor flagged public.is_staff() as directly RPC-callable by anon and
-- authenticated (Postgres grants EXECUTE to PUBLIC by default on new functions). Not a data leak
-- -- anon has no auth.uid(), so a direct call only ever returns false -- but anon never
-- legitimately needs to call it, and the only two things that reference it (the web_leads "staff
-- read" / "staff update" RLS policies) only ever run for the authenticated role. So authenticated
-- keeps EXECUTE, anon loses it.
revoke execute on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;
