# Vice Cover — Sunset Cover Maker

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Avapage/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Avapage/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

[Bounty page — Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01)

Vice Cover turns your own photos into a multi-panel poster in the style of a
Vice City sunset: a big hero panel, two supporting panels, bold original
lettering over a dusk scrim, and a warm neon grade. It opens with a finished
cover already on screen — sunset over the bay, palm silhouettes, a neon
skyline — all drawn procedurally, so it looks like a poster before you load a
single photo.

## How it works

1. **Load photos** — drop in as many of your own as you like, or try the two
   bundled demo photos (Boulevard, Pier). Click a thumbnail, then click a
   panel on the cover to fill it.
2. **Pick a layout and grade** — Poster (hero + two panels), Duo (tall panel
   beside two stacked ones), or Hero (one full-bleed photo). Grades: Sunset,
   Neon, or Noir.
3. **Write the lettering** — a caption and a sub-caption, in white, gold, or
   neon pink. The caption auto-fits to the cover width.
4. **Crop each panel** — click a panel to select it, then zoom and pan it with
   the sliders, or swap it back to procedural demo art.
5. **Export** — one click downloads the PNG at 1080 × 1080, 1080 × 1350, or
   1920 × 1080.

Everything runs offline from static files under `app/`: no network requests,
no uploads, your photos never leave your machine. The demo panels are drawn
in code (`app/src/art.js`) — gradients, silhouettes and a seeded random — so
the app carries no borrowed artwork. No Rockstar logos, art, or fonts are
used anywhere; the lettering is set in system sans-serifs.

## Try it

```sh
node serve.ts
```

Then open <http://localhost:8080>.

## Files

- `app/index.html`, `app/style.css` — page and editor styling.
- `app/src/main.js` — wires the editor: photos, panels, export.
- `app/src/cover.js` — cover renderer: layouts, grades, lettering, export sizes.
- `app/src/art.js` — the procedural demo art (sunset, palms, skyline, car).
- `app/src/shots.js` — fixed scenes for the screenshots.
- `app/samples/` — two demo photos made for make.fun, free to use.
- `screenshots/` — the entry screenshots (cover first, then the editor).
- `main.ts` — hands `app/` and `screenshots/` to the grader and writes the dossier.
- `serve.ts` — a tiny static server for local tries.

## License

MIT — see [LICENSE](LICENSE).
