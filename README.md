# JomMasak Planner

JomMasak is a smart meal planning web app that helps users plan their weekly meals, discover recipes, generate grocery lists, and get AI-powered meal suggestions — making everyday cooking easier.

## Stack

- React + Vite, Tailwind CSS
- [Supabase](https://supabase.com) (Postgres + Auth) for data and login
- AI suggestions are a local heuristic (see `src/services/aiService.js`) that picks from your recipe database — not a real model call.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a free project at [supabase.com](https://supabase.com/dashboard).
3. In the Supabase dashboard, open **SQL Editor** and run, in order:
   - `supabase/schema.sql` — creates tables, RLS policies, and the profile-creation trigger.
   - `supabase/seed.sql` — seeds the shared recipe library (generated from the old mock data; regenerate with `node scripts/generateSeedSql.mjs` if you edit `src/data/mockRecipes.js`).
4. Copy `.env.example` to `.env.local` and fill in your project's URL and anon key (Supabase dashboard → **Project Settings → API**):
   ```
   cp .env.example .env.local
   ```
5. Run the app:
   ```
   npm run dev
   ```

## Deploying

The frontend is a static Vite build, so it deploys to any static host (Vercel, Netlify, Cloudflare Pages). Supabase is already hosted — no backend to deploy separately. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on your host, matching `.env.local`.
