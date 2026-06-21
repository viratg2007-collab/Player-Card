# Friends & cloud (Supabase) setup

The Friends feature (accounts, find/follow players, view their stats) needs a
backend. Player Card uses **Supabase** (free tier). Until you add the keys
below, the app stays fully local and the Friends tab shows a setup notice — so
nothing else is affected.

**Architecture:** local-first. Your own matches still live in your browser
(IndexedDB). When signed in you **Sync** (publish a copy of your profile +
matches to Supabase) so others can view them. The Friends tab reads other
players' data from Supabase. Auth is email + password.

## 1. Create the project

1. Sign up at <https://supabase.com> and create a new project (pick a region
   near you; remember the database password).
2. In the project: **SQL → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and **Run**. This creates the
   `profiles`, `matches`, and `follows` tables with row-level security.

## 2. Add the keys

In Supabase: **Project Settings → API**. Copy the **Project URL** and the
**anon public** key. Create a file `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

The anon key is meant for client use — access is enforced by the RLS policies in
the schema. `.env.local` is gitignored. Restart `npm run dev` after adding it.

## 3. Auth emails (dev convenience)

By default Supabase requires email confirmation on sign-up. For quick local
testing: **Authentication → Providers → Email → turn off "Confirm email"**
(turn it back on for production). Otherwise, confirm via the link Supabase emails
before signing in.

## 4. Use it

Open the **Friends** tab → sign up → pick a **@username** → **Sync** to publish
your stats → search for a friend's username → **Follow** → tap them to see their
profile and recent matches.

## Notes / future hardening

- Profiles and matches are currently readable by any signed-in user (so you can
  view anyone you follow). To make stats visible only to approved followers,
  tighten the `select` policies in `schema.sql` (e.g. join against `follows`).
- Sync is manual (the **Sync** button). A future step is auto-publishing on every
  local save when signed in.
- For the native (Capacitor) app, configure Supabase auth redirect URLs for your
  app scheme before shipping.
