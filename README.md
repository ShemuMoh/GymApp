# Gym Timer

A workout companion app built with Next.js + Tailwind CSS + Supabase.

## Features

- **Tools tab** — switch between:
  - **Single Timer** — set a duration and count down. When it finishes, an alarm loops repeatedly (plus a visual flash) until you press **Repeat** (restarts the same duration) or **Reset**.
  - **Double Timer** — set two timers (e.g. Work / Rest) that alternate automatically without pressing a button. Choose between **Indefinite** (alternates forever until stopped) or **Rounds** (alternates N times then auto-stops with a finish alert).
  - **Counter** — preset tally counters (Reps, Sets, Rounds, Rest breaks) with +/-/reset, persisted locally in the browser.
- **Exercises tab** — add your own exercises, and log sets/reps/weight per session with the date. History is kept per exercise. Everything syncs to your Supabase account, so it's available across devices.

Signing in (via a magic link emailed to you) is required to use the app, since exercise data is tied to your account.

## Getting Started

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and anon key (see below), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. In your Supabase project, open the **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates the `exercises` and `exercise_records` tables with row-level security scoped to each signed-in user.
2. Under **Authentication → Providers**, make sure **Email** is enabled (it is by default).
3. Under **Authentication → URL Configuration**, add the URLs the magic link should be allowed to redirect back to:
   - `http://localhost:3000` (local dev)
   - your production Vercel URL (e.g. `https://gym-timer-app.vercel.app`)
4. Under **Project Settings → API**, copy the **Project URL** and **anon public key** into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

## Deploying

### 1. Push to GitHub

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

- Go to [vercel.com/new](https://vercel.com/new), import the GitHub repo, and click Deploy.
- In the Vercel project's **Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`), then redeploy.
- Add the deployed URL to Supabase's **Authentication → URL Configuration** redirect list (step 3 above) so magic links work in production.
