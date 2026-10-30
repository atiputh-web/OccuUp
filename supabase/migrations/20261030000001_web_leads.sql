-- OccuUp website: lead form ("New hotel" on the Log in page) while the app is not live yet.
-- The public (publishable / anon) key can ONLY insert a new lead. Nobody can read leads
-- with that key. OccuUp staff read and update leads when signed in.
--
-- public.is_staff() does not exist yet in this project (checked: no 20261022000001_core.sql,
-- no prior migrations at all). This is OccuUp's own company staff (platform operators who see
-- inbound website leads), not a hotel's per-property Owner/GM/Marketer/Viewer role -- those are
-- two different things. Bootstrapping a minimal version here; if the backend team later ships a
-- fuller staff/role system, replace this block (and keep the two policies below pointed at
-- whatever function ends up meaning "is OccuUp platform staff").
create table if not exists public.staff (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
comment on table public.staff is 'OccuUp company staff (platform operators) who may read/manage website leads. Not a hotel property role. Add rows via Table Editor or service_role; no anon/authenticated policy grants any access.';
alter table public.staff enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create table if not exists public.web_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null check (char_length(email) between 5 and 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  hotel_name  text check (hotel_name is null or char_length(hotel_name) <= 200),
  lang        text check (lang is null or lang in ('en', 'th')),
  source      text check (source is null or char_length(source) <= 50),
  page        text check (page is null or char_length(page) <= 100),
  status      text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  notes       text
);
comment on table public.web_leads is 'Website lead form. Insert-only for the public key. Personal data under PDPA: delete leads that never become customers after 12 months.';

alter table public.web_leads enable row level security;

-- Column-level privileges: the public key may set only these five columns.
revoke all on public.web_leads from anon, authenticated;
grant insert (email, hotel_name, lang, source, page) on public.web_leads to anon, authenticated;
grant select, update on public.web_leads to authenticated;

create policy "web leads: anyone can submit"
  on public.web_leads for insert to anon, authenticated
  with check (status = 'new' and notes is null);

create policy "web leads: staff read"
  on public.web_leads for select to authenticated
  using (public.is_staff());

create policy "web leads: staff update"
  on public.web_leads for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create index if not exists web_leads_created_at_idx on public.web_leads (created_at desc);
