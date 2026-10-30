# Supabase and the website

The website talks to Supabase in exactly one way: the "New hotel" form inserts a row into `public.web_leads`.
Everything else (accounts, hotels, uploads, campaigns) belongs to the app and the backend repo.

## Keys: which one goes where
| Key | Looks like | Where it may go |
|---|---|---|
| Publishable key | `sb_publishable_...` | Website `config.js`, app front end. Safe in the browser; access is limited by Row Level Security |
| Legacy anon key | long JWT starting `eyJ...` | Same as publishable (legacy). Supabase plans to retire legacy keys; prefer the publishable key |
| Secret key | `sb_secret_...` | Server side only (Edge Functions, backend jobs). NEVER in this repo, never in a browser, never in chat |
| Legacy service_role key | JWT with role `service_role` | Same as secret. NEVER here |

Find them: Dashboard → Project Settings → API Keys. Project URL: Project Settings → Data API (`https://<ref>.supabase.co`).

## Create the leads table
1. Coordinate with the backend team: if their repo has `supabase/migrations`, copy `supabase/migrations/20261030000001_web_leads.sql` there so there is one migration history.
2. Or run it once in Dashboard → SQL Editor (paste the file, Run).
3. It needs `public.is_staff()` from the core migration (20261022000001_core.sql). If the backend team renamed it, adjust the two staff policies.
4. Test locally before running: `npm install && npm run test:db` (10 checks: public key can insert only, cannot read, cannot set status/notes, bad email rejected, staff can read/update).

What the public key can do: insert `email`, `hotel_name`, `lang`, `source`, `page`. Nothing else, and it cannot read any lead back.

## See the leads
Dashboard → Table Editor → `web_leads` (you are the project owner, so you see everything). Set `status` to `contacted` / `qualified` / `closed` / `spam` as you work them. Inside the app, OccuUp staff (users in `public.staff`) can read and update them.

## PDPA
- The form shows: "We use your email and hotel name only to contact you about OccuUp." Keep that promise; do not add leads to newsletters without consent.
- Delete leads that never become customers after 12 months (table comment says so). A scheduled job can do it later.
- The privacy policy page (FIX_LIST C2) must mention this form.

## Turn on the form
In `public/assets/js/config.js`:
```js
supabaseUrl: "https://<ref>.supabase.co",
supabasePublishableKey: "sb_publishable_xxxxxxxx",
```
Deploy, open `https://<domain>/#/signup`, submit a test lead, check it appears in Table Editor, then delete the test row.
