# Tanay's Galaxy — Portfolio Website

Next.js portfolio site for [Tanay's Galaxy](../README.md). Deploy to **Vercel** from the `website` directory.

## Quick start

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub (or connect the folder in Vercel).
2. Set **Root Directory** to `website`.
3. Framework preset: **Next.js** (auto-detected).
4. Deploy.

Or use the Vercel CLI from this folder:

```bash
npx vercel
```

## Replace placeholders before public launch

| Asset | Path | Action |
|-------|------|--------|
| Rocket artwork | `public/rocket.png` | Add `Rocket-removebg-preview.png`, update `content/hotspots.json` `imageSrc` |
| Résumé PDF | `public/resume-placeholder.pdf` | Replace with final PDF |
| Email / LinkedIn / GitHub | `content/site.json` | Update `contact` fields |
| Project images | Project pages | Replace `[PLACEHOLDER]` cards with real assets |
| Unverified awards | `content/awards.json` | Confirm or remove `verified: false` entries |

## Content updates

Edit JSON files in `content/` — no code changes needed for copy, projects, skills, or awards.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Static generation (no animations per design spec)

## Site map

- `/` — Rocket navigation hub
- `/about` — About Me
- `/projects` — Solar system + project grid
- `/projects/[slug]` — Case study pages (5 projects, 3 planets)
- `/skills` — Skills cabinet + Assembly Bay
- `/awards` — Constellation archive
- `/resume` — Résumé + PDF download
- `/contact` — Contact links

**Note:** Model rocket content is intentionally excluded. Projects use **3 clusters** only.
