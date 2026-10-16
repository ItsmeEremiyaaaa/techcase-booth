# TechCase 3D Booth — StudyQuest

An interactive 3D website for the **StudyQuest** booth at the **TechCase** campus technology showcase. Visitors can walk around a real-time school basketball court, inspect the booth table, backdrop and roll-up banner, preview the app on the demo phones and tablet, and see how students discover, scan and try the app.

It is a static site (React + Vite + Three.js) with no backend, built to be published on GitHub Pages.

> **Placeholders:** the TechCase and StudyQuest logos, the app screens and the printed designs are placeholder artwork, not official assets. All dimensions are planning estimates. See [Customizing](#customizing) for how to swap them.

---

## Features

- **Real-time 3D gym**: FIBA-proportioned court with geometry line markings, hoops, bleachers with spectators, scoreboard, a wall banner and two neighbouring booths.
- **StudyQuest booth**: blue floor mat, 3 × 2.4 m backdrop with LED arm lights, fitted blue table cover with printed front, roll-up banner, two table QR stands and a floor QR sign, two phones and a tablet on stands showing the app, a brochure stack and balloon columns.
- **People**: lightweight procedural students and booth reps with natural poses (scanning a QR code, using a phone, presenting, chatting) and subtle idle motion.
- **Interaction**: hover highlights, outlines and floor markers, clickable pins, an info panel for each object (bottom sheet on phones), an app-screen carousel, and a QR code generated from your link.
- **Camera**: smooth orbit, zoom and limited panning; reset and "Focus booth" buttons; Overview, Table, Banner, Devices, Visitors and Full-court presets; keyboard orbit and zoom.
- **Website**: hero, 3D experience, design-detail cards that work without 3D, a materials and implementation table with a metric/imperial toggle, About, and a footer.
- **Performance**: the 3D code loads only when the viewer nears the screen; quality is set per device (Auto/High/Medium/Low); pixel ratio is capped and adjusts at runtime; repeated objects use instancing; shared geometry and materials are freed on unmount; rendering pauses off-screen.
- **Fallbacks**: an image view, which is automatic when WebGL is missing or the scene fails, and a "Tap to explore" gate on touch screens so the page still scrolls.
- **Accessibility**: keyboard-reachable controls with visible focus, labelled icon buttons, reduced-motion support (no idle animation, instant camera moves), and all booth information available as plain HTML.

## Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript, Vite 7 |
| 3D | three.js 0.180, @react-three/fiber 9, @react-three/drei 10 (CameraControls, Html, Outlines, ContactShadows, Environment with local Lightformers) |
| Icons | lucide-react |
| QR codes | qrcode (generated in the browser) |
| Fonts | Sora + Plus Jakarta Sans, self-hosted via @fontsource (no Google Fonts requests) |
| Deploy | GitHub Actions → GitHub Pages |

No runtime network requests go to third-party servers: every texture, font and icon ships with the site.

## Quick start

Requirements: **Node.js 20 or newer** (22 recommended) and npm.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (served from `/`) |
| `npm run build` | Type-check and build to `dist/` (base `/techcase-booth/` by default) |
| `npm run preview` | Serve the production build at `http://localhost:4173/techcase-booth/` |
| `npm run typecheck` | Type-check only |

To build for a different base path:

```bash
VITE_BASE=/my-repo/ npm run build     # project site at https://<user>.github.io/my-repo/
VITE_BASE=/ npm run build             # custom domain or <user>.github.io repository
```

## Project structure

```
.github/workflows/deploy.yml   Build + deploy to GitHub Pages on every push to main
design-src/                    Source templates for the placeholder screens and print textures
public/
  assets/brand/                Placeholder logo marks (replace with official files)
  assets/screens/              App screens shown on the 3D devices and in the preview
  assets/textures/             Backdrop, roll-up, table front, wall banner, scoreboard
  assets/fallback/             Still render used in the hero and image view
src/
  config/site.ts               Event/app names, QR link, logo paths, base-path helper
  content/booth.ts             All booth copy, specs, materials table, app screen captions
  components/                  Header, Hero, ExperienceSection, InfoPanel, AppPreview, …
  three/                       3D scene: Experience, Court, Booth, People, views, textures
  lib/                         Small store, device detection, unit formatting
  styles/global.css            Design tokens and all styles
```

## Customizing

| To change… | Edit |
|---|---|
| The link in every QR code | `qrUrl` in `src/config/site.ts` (point it at the StudyQuest beta download or feedback page) |
| Event / app names | `src/config/site.ts` |
| Booth copy, dimensions, materials, visitor steps | `src/content/booth.ts` |
| App screenshots | Replace the files in `public/assets/screens/` with the same names (phones: 540 × 1170, tablet: 768 × 1024, WebP/PNG/JPG). Then update the "Sample screens" note in `src/components/AppPreview.tsx`. |
| Logos | Replace `public/assets/brand/*-placeholder.svg`, or point `site.logos` at new files |
| Backdrop, roll-up, table front, wall banner | Replace the files in `public/assets/textures/` (keep the aspect ratios: 5:4, 0.425:1, 2.37:1, 5:1), or edit `design-src/print.html` and re-render |
| Camera presets and pin positions | `src/three/views.ts` |
| Colours | CSS tokens in `src/styles/global.css` and `C` in `src/three/shared.ts` |

### Re-rendering the placeholder artwork (optional)

The images in `public/assets/screens` and `public/assets/textures` were rendered from the HTML templates in `design-src/`. To change them:

```bash
pip install playwright pillow && python -m playwright install chromium
node design-src/build-icons.mjs        # extracts the Lucide icons used by the templates
python3 design-src/render.py           # or: python3 design-src/render.py screens | print
```

`public/assets/fallback/booth-overview.webp` is a screenshot of the 3D scene. If you change the scene a lot, take a new 1600 × 1100 screenshot of the viewer and replace it.

## Deploying to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds the site and deploys `dist/` on every push to `main` (and on manual runs). It sets `VITE_BASE` to `/<repository-name>/` automatically.

**One-time setup**

1. Push this project to a GitHub repository (for example `ItsmeEremiyaaaa/techcase-booth`) on the `main` branch.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Open the **Actions** tab. Re-run **Deploy to GitHub Pages** if the first run happened before step 3.
5. When it finishes, the site is at `https://<user>.github.io/<repository-name>/` (the URL also appears in the run summary).

**Deployment checklist**

- [ ] `npm run build` succeeds locally.
- [ ] `npm run preview` works at `http://localhost:4173/techcase-booth/`, and the 3D scene, images and fonts load.
- [ ] Pages source is set to **GitHub Actions**.
- [ ] The Actions run is green, and the live URL loads with no 404s in the browser console.
- [ ] `site.qrUrl` points at the real link, and a printed QR code scans on Android and iPhone.
- [ ] Placeholder logos and screens are replaced, or clearly labelled, before the showcase.

**Troubleshooting**

| Symptom | Fix |
|---|---|
| Blank page, 404s for `/assets/...js` | The base path is wrong. The workflow handles this; for manual builds use `VITE_BASE=/<repo>/ npm run build`. |
| Pages shows the README instead of the site | Pages source is "Deploy from a branch". Switch it to **GitHub Actions**. |
| Workflow fails at "Deploy" with a permissions error | Keep the `permissions` block in the workflow. Under **Settings → Environments → github-pages**, allow the `main` branch. |
| `npm ci` fails | Commit `package-lock.json` and keep it in sync (`npm install` locally, then commit). |
| Refresh on a section gives a 404 | It should not: navigation uses `#section` anchors only, so there are no client-side routes. |
| 3D shows "unavailable" | The browser has WebGL disabled or blocked (some school or locked-down PCs). The image view and all details still work. |

## Performance notes and limitations

- Initial page JS is ~90 kB gzipped. The 3D bundle (three.js + R3F + scene, ~290 kB gzipped) loads only when the viewer comes near the screen.
- **High** quality adds a glossy reflective floor, 2048 px soft shadows and a fuller crowd. **Medium** (default on phones and tablets) uses 1024 px shadows. **Low** turns off shadows and background people and renders at 1× pixel ratio. Auto mode also lowers the pixel ratio when the frame rate drops.
- Changing quality rebuilds the scene (about a second).
- The people are stylized procedural figures, not rigged characters. That keeps the site light and avoids licensed models.
- Testing was done in headless Chromium with software WebGL at 1440 × 900 (desktop) and 390 × 844 (touch phone). Real-device performance depends on the GPU, so check it on the phones and laptops you will use at the event. Older or low-memory Android phones may need the Low setting.
- iPhone Safari does not support element full screen, so the full-screen button is hidden there.

## Accessibility

- Every control is a real `<button>` or link, with labels on icon-only buttons and a visible focus ring.
- With the viewer focused: arrow keys orbit, `+` and `−` zoom, `Home` resets, and `Esc` closes the info panel.
- Reduced motion turns off idle animation, pulsing pins and smooth camera moves.
- The booth design cards and the materials table carry all the 3D content as plain HTML.

## Credits

- Icons: [Lucide](https://lucide.dev) (ISC license)
- Fonts: Sora and Plus Jakarta Sans (SIL Open Font License), via Fontsource
- 3D: three.js, @react-three/fiber, @react-three/drei (MIT)
