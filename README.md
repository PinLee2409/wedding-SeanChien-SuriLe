# ✈️ Sean Chien & Suri Le — Flight to Forever

A luxury, aviation-themed **online wedding invitation** for a pilot groom, built
as a **frontend-only** React app. “Boarding Pass Wedding Invitation / Flight to
Forever.” No backend, no database, no auth — it deploys to any static host
(Vercel, Netlify, GitHub Pages…).

- 🎨 Ivory · navy · champagne gold · soft sky blue · warm white
- 🛬 Animated clouds, flying plane, runway lights, boarding pass, passport stamp,
  flight route line
- 🎟️ Personalised, **downloadable boarding-pass card** (PNG + PDF)
- 🔗 Per-guest links, ✉️ personalised greeting, 🗓️ add-to-calendar, 🗺️ map,
  🎵 tap-to-play music
- ♿ Reduced-motion support, mobile-first, semantic & accessible

---

## 1. Tech stack

| Purpose        | Library                          |
| -------------- | -------------------------------- |
| Framework      | React 19 + TypeScript            |
| Build tool     | Vite                             |
| Styling        | Tailwind CSS v4                  |
| Animation      | Motion for React (`motion`)      |
| Icons          | lucide-react                     |
| Card → image   | html-to-image                    |
| Card → PDF     | jsPDF                            |
| Confetti       | canvas-confetti                  |

---

## 2. Run locally

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build locally
```

> Requires Node 20+.

---

## 3. Where everything lives

```
src/
  config/wedding.config.ts   ← 🟡 EDIT THIS: all names, dates, text, asset paths
  components/
    sections/                ← the page sections (Hero, Timeline, Gallery, …)
    decorations/             ← clouds, flying plane, runway lights, stamp, route
    ui/                      ← reusable bits (SmartImage, Countdown, MusicToggle…)
  hooks/                     ← guest name, audio, countdown
  lib/                       ← url helpers, .ics, PNG/PDF export, motion presets
public/
  images/  videos/  music/   ← 🟡 DROP YOUR ASSETS HERE
```

**You will normally only touch `src/config/wedding.config.ts` and the `public/`
folders.**

---

## 4. Change bride / groom / date / location

Open [`src/config/wedding.config.ts`](src/config/wedding.config.ts). It is fully
commented. The important fields:

```ts
couple: {
  groom: { name: 'Sean Chien', fullName: 'Sean Chien', role: 'Groom' },
  bride: { name: 'Suri Le', fullName: 'Suri Le', role: 'Bride' },
},

date: {
  iso: '2026-12-20T16:00:00+07:00', // powers the countdown & calendar file
  displayDate: '20 · 12 · 2026',
  weekday: 'Chủ Nhật',
  time: '16:00',
  durationHours: 4,
},

venue: {
  name: 'Trung tâm Hội nghị & Tiệc cưới Diamond Palace',
  hall: 'Sảnh Sapphire · Tầng 3',
  address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  mapEmbedUrl: '…/maps?q=…&output=embed', // Google Maps → Share → Embed a map
  mapLink: 'https://maps.google.com/?q=…',
},

event: {
  flightCode: '1220', // boarding pass flight becomes  LOVE-1220
},
```

Change the **timeline** story (Check-in / Take-off / Cruising / Landing),
the **love message**, and the **thank-you** text in the same file.

### Google Maps

1. Open Google Maps → your venue → **Share** → **Embed a map** → copy the `src`
   URL into `venue.mapEmbedUrl`.
2. Put a normal map link in `venue.mapLink` (the “Mở Google Maps” button).
   Leave `mapEmbedUrl` as `''` to hide the embedded map.

---

## 5. Replace images / videos / music

Drop files into `public/` and keep the same names used in the config (or update
the config to match). Missing files show an **elegant placeholder**, so nothing
ever looks broken.

| Folder           | Example files                                             |
| ---------------- | -------------------------------------------------------- |
| `public/images`  | `hero.jpg`, `bride.jpg`, `groom.jpg`, `gallery-1..6.jpg`, `timeline-1..4.jpg`, `boarding-poster.jpg`, `prewedding-poster.jpg`, `og-cover.jpg` |
| `public/videos`  | `prewedding.mp4` (and an optional hero background video)  |
| `public/music`   | `wedding.mp3`                                            |

Each folder has its own `README.md` with recommended sizes. See also the
`og-cover.jpg` (1200×630) used for the social-share preview referenced in
`index.html`.

- **Music never autoplays with sound.** It starts only after the guest taps the
  🎵 button and fades in gently. Set `music.src: ''` to remove it entirely.
- **Video** frames hide themselves automatically if the file is absent.

---

## 6. Guest personalisation & guest links

The invitation reads the guest’s name from the URL:

```
https://your-site.com/?guest=Anh%20Tuấn%20%26%20Chị%20Lan
```

- If `?guest=` is present, the guest sees **“Kính mời: {tên}”** and their name is
  printed on the downloadable boarding pass.
- If it is missing, an elegant modal asks them to type their name
  (**“Nhập tên của bạn để mở thiệp mời”**). The URL updates without a reload.

### Generating links for each guest

Scroll to **“Tạo liên kết mời riêng”** (near the bottom — *Dành cho cô dâu &
chú rể*). Type a guest’s name, then **Chép** (copy) the generated link and send
it. Everything runs in the browser; names are URL-encoded automatically.

---

## 7. Downloadable boarding pass

Each guest can save their personalised card (files are named
`wedding-invitation-<guest>.png` / `.pdf`):

- **Tải thiệp PNG** — a **hidden, fixed 900px card** (with ivory padding) is
  captured with `html-to-image` at `pixelRatio: 2` (≈ 1800px wide, high-res).
- **Tải thiệp PDF** — the PNG is centred on an **A4 portrait** page with margins
  via `jsPDF`.

Why a separate hidden node? The on-screen card is fluid/responsive; exporting a
fixed-size clone guarantees a **crop-free, consistent, high-resolution** result
regardless of screen size — no `transform: scale` on the exported element.
`waitForImagesBeforeExport()` waits for fonts + image decode first, buttons are
never captured, loading/disabled/error-toast states are handled, and the export
retries without font embedding if a strict-CORS environment blocks it.

---

## 8. Deploy to Vercel

This is a static Vite SPA.

1. Push the repo to GitHub/GitLab.
2. In Vercel: **New Project → Import** the repo.
   - Framework preset: **Vite** (auto-detected)
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy. 🎉

`vercel.json` already contains the SPA rewrite so deep links work:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

You can also deploy the `dist/` folder to Netlify, Cloudflare Pages, or GitHub
Pages — it’s just static files.

---

## 9. Accessibility & performance notes

- Respects `prefers-reduced-motion` (ambient animations and confetti pause).
- Semantic landmarks, labelled buttons/inputs, keyboard-friendly modal.
- Heavy export libraries (`html-to-image`, `jsPDF`) are **lazy-loaded** on first
  download, keeping the initial bundle small for mobile.

Made with ♥ for Sean Chien & Suri Le's flight to forever.
