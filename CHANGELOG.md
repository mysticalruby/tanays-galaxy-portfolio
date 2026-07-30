# Build changelog

## Implemented

- Next.js app with dark-only design system (blue, yellow, silver, gold)
- Fonts: Space Grotesk + IBM Plex Sans
- 7 pages + 5 project case studies
- Static rocket homepage with hotspot overlays and modals (Build Process, Currently Exploring)
- Header nav + accessibility module list below rocket
- 3-planet Projects solar system + mobile planet cards + grid fallback
- Skills cabinet (6 categories) + Rocket Assembly Bay (manual/auto, click-only)
- Awards constellation SVG + grouped cards + full list
- Résumé page with placeholder PDF embed and download
- Contact page with placeholder email/LinkedIn/GitHub
- No animations (static UI, instant hover/focus outlines only)
- No model rocket content anywhere

## Placeholders still needing your assets

1. **Rocket PNG** — Replace `public/rocket.svg` with final artwork; set `content/hotspots.json` → `imageSrc` to `/rocket.png` and recalibrate hotspot percentages.
2. **Résumé PDF** — Replace `public/resume-placeholder.pdf`.
3. **Contact** — Update `content/site.json` contact fields.
4. **Project visuals** — Each case study lists specific `[PLACEHOLDER]` items.
5. **Robotics portfolio** — Select 2–3 artifacts; verify FRC roles in content.
6. **Portrait / About visual** — Abstract placeholder on About page.

## Facts to verify before public launch

- GVS: 88% classification, chi-square p < 0.001
- Flo-Wrist: R² ≈ 0.9999, report title/objective
- Awards marked `verified: false` in `content/awards.json`
- Leadership entries on résumé (Tech Awareness Association, MAMS tournament, FRC)
- HiMCM / modeling competition publication permissions

## Deploy

```bash
cd website
npx vercel
```

Set Vercel root directory to `website` if deploying from the monorepo-style parent folder.
