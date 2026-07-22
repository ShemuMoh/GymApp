# Gym Timer

A simple workout timer app built with Next.js + Tailwind CSS.

## Features

- **Single Timer** — set a duration and count down, with a sound + visual alert when it finishes.
- **Double Timer** — set two timers (e.g. Work / Rest) that alternate automatically without pressing a button. Choose between:
  - **Indefinite** — alternates forever until you stop it.
  - **Rounds** — alternates for a set number of rounds, then auto-stops with a finish alert.
- **Counter** — preset tally counters (Reps, Sets, Rounds, Rest breaks) with +/-/reset, persisted locally in the browser.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

### 1. Push to GitHub

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

- Go to [vercel.com/new](https://vercel.com/new), import the GitHub repo, and click Deploy.
- Or via CLI: `npx vercel` (then `npx vercel --prod` to promote to production).

No environment variables or extra configuration are required.
