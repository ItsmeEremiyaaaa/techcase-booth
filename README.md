# TechCase Showcase 3D — StudyQuest

A full-screen, real-time 3D walk-through of the **TechCase** campus technology showcase, featuring the **StudyQuest** booth. Visitors explore the school gym, inspect the booth, see the app on the demo devices, and read about StudyQuest, with a QR code and link to the live app at [studyquest-a547c.web.app](https://studyquest-a547c.web.app/).

It is a static site (React + Vite + Three.js) with no backend, published on GitHub Pages:
**https://itsmeeremiyaaaa.github.io/techcase-booth/**

> The booth uses the real StudyQuest roll-up, brochure, fox mascot and app screenshots, and the TechCase event uses the BSIT SITeS seal. Team bios are sample text. Booth dimensions are planning estimates.

---

## What's in it

- **Full-screen 3D gym.** A basketball court with line markings and hoops, bleachers with spectators (mostly in SMCBI uniforms), a scoreboard, the TechCase wall banner with the SITeS seal, and neighbouring booths.
- **StudyQuest booth, in the app's colours.** A dark brown mat with an orange edge, a 3 × 2.4 m StudyQuest backdrop with the fox mascot, an orange table cover with the logo and “Study. Compete. Level Up.”, the team's real 33 × 80 in roll-up, a stack of the real tri-fold brochures, StudyQuest-styled QR stands, two phones and a landscape tablet with real app screens, and orange, cream, purple and gold balloon columns.
- **The team, in SMCBI uniform.** All four wear the men's uniform (light blue polo with the school seal on the pocket, dark slacks). Jeremiah (Developer & Project Leader) stands in the centre behind the tablet, with Peter, Sharwin and Joemar beside him. Hover or tap anyone (or their name tag) to see their profile; the selected member waves. A Team panel lists all four.
- **Visitors who walk and use the booth.** Students walk up from the court, try the demo phones, read the roll-up, take a brochure and scan the QR code; a teacher with a clipboard visits each booth; friends walk laps of the court. They share the table spots without bumping into each other, and the team member nearest turns to them and answers in a speech bubble. Click any visitor to make them wave.
- **Interaction.** Hover highlights, outlines and floor markers, clickable pins, and an info panel for each booth part (a bottom sheet on phones).
- **About StudyQuest panel.** The fox mascot, the app's features and supported courses, a swipeable gallery of real screenshots, a QR code, a "Play StudyQuest" button, the feedback page and the contact email.
- **Camera.** Smooth orbit, zoom and limited panning; Reset and Focus booth buttons; presets for Overview, Table, Banner, Devices, Visitors and Full court; keyboard control.
- **Welcome card.** Shown after loading, with "Explore the booth", "About StudyQuest" and "Meet the team".
- **Performance.** A graphics menu (Auto/High/Medium/Low; Auto picks a level for the device and steps down by itself if the frame rate stays low), a camera that stays put when the level changes, a capped pixel ratio that drops automatically when the frame rate does, instancing for repeated objects, shared geometry and materials freed on unmount, and code-splitting so the 3D bundle loads after the first paint.
- **Fallback.** A still render with every booth panel and the About panel still available, used automatically when WebGL is missing or the scene fails to start.
- **Accessibility.** Real buttons with labels and visible focus, keyboard camera control, Esc to close panels, and reduced-motion support (no idle animation, instant camera moves).

## Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript, Vite 7 |
| Look | StudyQuest palette (orange, cream, brown, purple, gold), Fredoka + Nunito like the app's print materials |
| 3D | three.js 0.180, @react-three/fiber 9, @react-three/drei 10 |
| Icons | lucide-react |
| QR codes | qrcode (generated in the browser) |
| Fonts | Fredoka + Nunito, self-hosted via @fontsource |
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
design-src/                    Print templates (HTML), the roll-up PDF, the tablet screenshot, render script
public/assets/
  brand/                       StudyQuest bolt mark, fox mascot card, TechCase (SITeS) seal
  screens/                     Real StudyQuest screenshots (phones) + tablet composite
  textures/                    Backdrop, roll-up (from the team's PDF), brochure, table front, wall banner, scoreboard
  fallback/                    Still render used when 3D is unavailable
src/
  config/site.ts               Event/app names, app link for QR codes, logo paths
  content/booth.ts             Booth copy, app screen captions, About StudyQuest content
  content/team.ts              The four developers: names, roles, sample bios
  components/Showcase.tsx      Full-screen layout: top bar, bottom bar, welcome card, panels
  components/InfoPanel.tsx     Booth-part panel and About StudyQuest panel
  three/                       3D scene: Experience, Court, Booth, Team, People, Visitors, crowd, views, textures
  lib/                         Small store, device detection
  styles/global.css            All styles
```

## Customizing

| To change… | Edit |
|---|---|
| The app link in every QR code and button | `qrUrl` in `src/config/site.ts` |
| About StudyQuest text and feature list | `appInfo` in `src/content/booth.ts` |
| Team names, roles and bios (bios are sample text) | `src/content/team.ts` |
| Where each team member stands and how they look | `TEAM_SPOTS` in `src/three/views.ts` |
| Visitor routes, what they do and say, and the team's replies | `WALKERS` in `src/three/Visitors.tsx`; booth spots in `src/three/crowd.ts` |
| Uniform colours | `UNIFORM` in `src/three/People.tsx` |
| Booth panel copy and dimensions | `boothObjects` in `src/content/booth.ts` |
| App screenshots | Replace files in `public/assets/screens/` (374 × 810 phone crops) and update `appScreens` captions |
| Logos | `studyquest-mark.svg` (redrawn bolt mark); `techcase-logo.webp` (the SITeS seal, also used for the favicon and the wall banner) |
| Roll-up | Replace `design-src/StudyQuest-Rollup-Banner-33x80.pdf`, then `python3 design-src/render.py rollup` (needs poppler) |
| Tablet screen | Replace `design-src/tablet-home.png` (a wide screenshot), then `python3 design-src/render.py tablet` |
| Backdrop, table front, wall banner, scoreboard | Edit `design-src/print.html`, then `python3 design-src/render.py print` |
| Camera presets and pin positions | `src/three/views.ts` |

**Re-rendering the artwork (optional):**

```bash
pip install playwright pillow && python -m playwright install chromium
node design-src/build-icons.mjs
python3 design-src/render.py          # or: render.py tablet | print | rollup
```

Screenshots that show other students' names were left out of the phone gallery and the booth artwork on purpose. The tablet screenshot was supplied by the team and shows a rival's first name in the "Rival of the week" card. Keep that in mind if you add more.

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

Icons: [Lucide](https://lucide.dev) (ISC). Fonts: Fredoka, Nunito (SIL OFL) via Fontsource. StudyQuest artwork (roll-up, brochure, fox mascot) by the StudyQuest team. 3D: three.js, @react-three/fiber, @react-three/drei (MIT).
