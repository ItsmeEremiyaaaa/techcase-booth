# TechCase Showcase 3D — StudyQuest

A full-screen, real-time 3D walk-through of the **TechCase** campus technology showcase, featuring the **StudyQuest** booth. Visitors explore the school gym, inspect the booth, see the app on the demo devices, and read about StudyQuest, with a QR code and link to the live app at [studyquest-a547c.web.app](https://studyquest-a547c.web.app/).

It is a static site (React + Vite + Three.js) with no backend, published on GitHub Pages:
**https://itsmeeremiyaaaa.github.io/techcase-booth/**

> The TechCase and StudyQuest marks are placeholder artwork. App screens are real StudyQuest screenshots. Booth dimensions are planning estimates.

---

## What's in it

- **Full-screen 3D gym.** A basketball court with line markings and hoops, bleachers with spectators, a scoreboard, the TechCase wall banner, neighbouring booths and students walking around.
- **StudyQuest booth.** Floor mat, a 3 × 2.4 m backdrop with LED arm lights, a blue-covered demo table with a printed front, a roll-up banner, QR stands, two phones and a tablet showing real app screens, brochures, balloon columns, two booth reps and visiting students.
- **Interaction.** Hover highlights, outlines and floor markers, clickable pins, and an info panel for each booth part (a bottom sheet on phones).
- **About StudyQuest panel.** The app's features, a swipeable gallery of real screenshots, a QR code and a "Play StudyQuest" button.
- **Camera.** Smooth orbit, zoom and limited panning; Reset and Focus booth buttons; presets for Overview, Table, Banner, Devices, Visitors and Full court; keyboard control.
- **Welcome card.** Shown after loading, with "Explore the booth" and "About StudyQuest".
- **Performance.** A quality setting per device (Auto/High/Medium/Low), a capped pixel ratio that drops automatically when the frame rate does, instancing for repeated objects, shared geometry and materials freed on unmount, and code-splitting so the 3D bundle loads after the first paint.
- **Fallback.** A still render with every booth panel and the About panel still available, used automatically when WebGL is missing or the scene fails to start.
- **Accessibility.** Real buttons with labels and visible focus, keyboard camera control, Esc to close panels, and reduced-motion support (no idle animation, instant camera moves).

## Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript, Vite 7 |
| 3D | three.js 0.180, @react-three/fiber 9, @react-three/drei 10 |
| Icons | lucide-react |
| QR codes | qrcode (generated in the browser) |
| Fonts | Sora + Plus Jakarta Sans, self-hosted via @fontsource |
| Deploy | GitHub Actions → GitHub Pages |

Everything (textures, fonts, icons) ships with the site. There are no runtime requests to third-party servers.

## Quick start

Requirements: **Node.js 20 or newer** (22 recommended).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (served from `/`) |
| `npm run build` | Type-check and build to `dist/` (base `/techcase-booth/` by default) |
| `npm run preview` | Serve the build at `http://localhost:4173/techcase-booth/` |
| `npm run typecheck` | Type-check only |

For another base path: `VITE_BASE=/my-repo/ npm run build`, or `VITE_BASE=/` for a custom domain.

## Controls

| | Mouse / trackpad | Touch | Keyboard |
|---|---|---|---|
| Look around | Left-drag | One-finger drag | Arrow keys |
| Zoom | Scroll | Pinch | `+` / `−` |
| Move | Right-drag | Two-finger drag | — |
| Inspect | Click a pin or object | Tap a pin or object | Tab to a pin, Enter |
| Reset / close | Reset button | Reset button | `Home` / `Esc` |

## Project structure

```
.github/workflows/deploy.yml   Build + deploy to GitHub Pages on every push to main
design-src/                    HTML templates for the tablet screen and the print textures
public/assets/
  brand/                       Placeholder logo marks (replace with official files)
  screens/                     Real StudyQuest screenshots (phones) + tablet composite
  textures/                    Backdrop, roll-up, table front, wall banner, scoreboard
  fallback/                    Still render used when 3D is unavailable
src/
  config/site.ts               Event/app names, app link for QR codes, logo paths
  content/booth.ts             Booth copy, app screen captions, About StudyQuest content
  components/Showcase.tsx      Full-screen layout: top bar, bottom bar, welcome card, panels
  components/InfoPanel.tsx     Booth-part panel and About StudyQuest panel
  three/                       3D scene: Experience, Court, Booth, People, views, textures
  lib/                         Small store, device detection
  styles/global.css            All styles
```

## Customizing

| To change… | Edit |
|---|---|
| The app link in every QR code and button | `qrUrl` in `src/config/site.ts` |
| About StudyQuest text and feature list | `appInfo` in `src/content/booth.ts` |
| Booth panel copy and dimensions | `boothObjects` in `src/content/booth.ts` |
| App screenshots | Replace files in `public/assets/screens/` (374 × 810 phone crops) and update `appScreens` captions |
| Logos | Replace `public/assets/brand/*-placeholder.svg` |
| Backdrop, roll-up, table front, tablet screen | Edit `design-src/print.html` / `design-src/screens.html`, then re-render (below) |
| Camera presets and pin positions | `src/three/views.ts` |

**Re-rendering the artwork (optional):**

```bash
pip install playwright pillow && python -m playwright install chromium
node design-src/build-icons.mjs
python3 design-src/render.py          # or: render.py screens | print
```

Screenshots that show other students' names were left out of the gallery and the booth artwork on purpose. Keep that in mind if you add more.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main` and sets the base path to `/<repository-name>/` automatically.

One-time setup (already done for this repo): **Settings → Pages → Source: GitHub Actions**.

| Symptom | Fix |
|---|---|
| Blank page, 404s for `/assets/...js` | Wrong base path. The workflow handles it; for manual builds use `VITE_BASE=/<repo>/`. |
| "Get Pages site failed" in Actions | Pages isn't enabled with the GitHub Actions source. |
| `npm ci` fails | Commit `package-lock.json` in sync with `package.json`. |
| 3D unavailable | WebGL is off or blocked on that device. The still image and all panels still work. |

## Performance notes

- Initial JS is ~85 kB gzipped. The 3D bundle (~290 kB gzipped) loads right after the first paint.
- **High:** reflective floor, 2048 px soft shadows, full crowd. **Medium** (default on phones and tablets): 1024 px shadows. **Low:** no shadows or background crowd, 1× pixel ratio.
- Testing ran in headless Chromium with software WebGL. Check the frame rate on the actual laptops and phones you'll use at the event, and set Low if it stutters.
- iPhone Safari has no element full screen, so the full-screen button is hidden there.

## Credits

Icons: [Lucide](https://lucide.dev) (ISC). Fonts: Sora, Plus Jakarta Sans (SIL OFL) via Fontsource. 3D: three.js, @react-three/fiber, @react-three/drei (MIT).
