# Kiara Forcadilla — Portfolio

Static site (HTML/CSS/JS, no build step). Open `index.html` directly or serve the folder.

## Structure

```
index.html                 content + metadata (SEO, Open Graph, JSON-LD)
favicon.svg / .png, apple-touch-icon.png
assets/
  css/  01-tokens … 18-motion   one file per concern, loaded in numeric order
  js/   core.js                 shared runtime (window.KF) — load first
        theme.js nav.js reveal.js hero.js interactions.js motion.js
        lets-connect.js fun-facts.js   reusable, self-contained sections
  img/  kiara-portrait.jpg, og-image.jpg (1200×630 link preview)
_archive/                  the previous single-file style.css / script.js
```

### JS conventions (`assets/js/core.js`)
- `KF.module(name, fn)` — every feature is isolated; an error in one never stops the others.
  Check `KF.modules` in the console: every entry should be `"ok"`.
- `KF.onScroll(write, read)` — one rAF scroll loop; all layout reads happen before writes.
- `KF.onFrame(fn)` — one animation clock that pauses while the tab is hidden.
- `KF.onResize(fn)` (debounced), `KF.scramble`, `KF.sparkle`, `KF.toast`, `KF.replay`.

### Theme
Tokens live in `01-tokens.css` (`:root` = light, `[data-theme="dark"]` = dark).
Saved choice: `localStorage["kf-theme"]`.

### Motion
`18-motion.css` + `motion.js`: intro curtain (once per visit, click/key skips), section titles
that rise word by word with a scrambling number, side dot navigation, small context cursor,
hero parallax, run-card progress meter, living gradient borders, timeline markers that light up,
reading-progress ring on the back-to-top button, smooth accordion, scroll-driven hero recede /
card settle / photo drift (modern browsers). All of it switches off with *Reduce motion*.

### When you deploy
`og:image` is relative. After publishing, change it to the full URL
(e.g. `https://<user>.github.io/<repo>/assets/img/og-image.jpg`) so link previews show the image.
