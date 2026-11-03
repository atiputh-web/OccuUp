/* =====================================================================
   OccuUp site settings. The only file you normally edit to go live.
   Everything here is PUBLIC (anyone can read it in the browser).
   NEVER put a Supabase secret key here (sb_secret_... or service_role).
   ===================================================================== */
const OCCUUP_LOCAL_DEMO = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

window.SITE = {
  /* Your domain without https://. If this ever changes, also update the matching
     domain literal in index.html, robots.txt and sitemap.xml (tools/check.mjs reminds you). */
  domain: "occuup.com",

  /* Where the hotel app lives once the backend team ships it,
     e.g. "https://app.occuup.com". */
  appUrl: OCCUUP_LOCAL_DEMO ? "http://127.0.0.1:4173" : "https://app.occuup.com",

  /* Local-only handoff to the retained synthetic backend. This evaluates false
     on occuup.com and must never be used as a production readiness signal. */
  localAppReady: OCCUUP_LOCAL_DEMO,

  /* Login-only public handoff. This may be enabled independently once the
     hosted back office is reachable. The marketing site forwards only the
     email address; the password is entered on app.occuup.com. */
  loginReady: !OCCUUP_LOCAL_DEMO,

  /* false = the app is not live yet:
       - "Log in" shows a short "opens soon" message
       - "New hotel" saves the email + hotel name to Supabase (table web_leads)
     true  = both buttons send people to appUrl + /login or /signup */
  appReady: false,

  /* Supabase project URL and PUBLISHABLE key (Dashboard > Project Settings > API Keys).
     The publishable key starts with sb_publishable_ (a legacy "anon" key starting
     with eyJ also works). Leave empty to keep the form in prototype mode. */
  supabaseUrl: "https://rwfulphqchekqokytxqr.supabase.co",
  supabasePublishableKey: "sb_publishable_cSJqS8YSqhYLbcVoV6Y09A_T_noXi19"
};
