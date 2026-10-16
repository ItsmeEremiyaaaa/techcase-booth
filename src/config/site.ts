/**
 * Site-wide configuration. Edit these values instead of hunting through components.
 * Everything marked PLACEHOLDER should be replaced before the showcase.
 */
export const site = {
  eventName: 'TechCase',
  eventTagline: 'Campus Technology Showcase',
  appName: 'StudyQuest',

  /** The live StudyQuest web app: used by every QR code and the "Play StudyQuest" buttons. */
  qrUrl: 'https://studyquest-a547c.web.app/',
  qrCaption: 'Scan to play StudyQuest',

  repoUrl: 'https://github.com/ItsmeEremiyaaaa/techcase-booth',

  /** Logo marks. The TechCase mark is still a PLACEHOLDER — replace the file with the official logo. */
  logos: {
    techcase: 'assets/brand/techcase-mark-placeholder.svg',
    studyquest: 'assets/brand/studyquest-mark.svg',
  },

  /** Still render shown when 3D is unavailable. Re-render it if the scene changes a lot. */
  sceneStill: 'assets/fallback/booth-overview.webp',
} as const

/** Resolves a file in /public against the Vite base path (works on GitHub Pages sub-paths). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
