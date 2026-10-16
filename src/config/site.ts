/**
 * Site-wide configuration. Edit these values instead of hunting through components.
 * Everything marked PLACEHOLDER should be replaced before the showcase.
 */
export const site = {
  eventName: 'TechCase',
  eventTagline: 'Campus Technology Showcase',
  appName: 'StudyQuest',

  /**
   * PLACEHOLDER — the link encoded in every QR code (3D stands, info panel, design cards).
   * Point it at the StudyQuest beta download page, APK link or feedback form.
   */
  qrUrl: 'https://itsmeeremiyaaaa.github.io/techcase-booth/',
  qrCaption: 'Scan to try StudyQuest',

  repoUrl: 'https://github.com/ItsmeEremiyaaaa/techcase-booth',

  /** PLACEHOLDER marks — replace the files (keep the names) or change the paths. */
  logos: {
    techcase: 'assets/brand/techcase-mark-placeholder.svg',
    studyquest: 'assets/brand/studyquest-mark-placeholder.svg',
  },

  /** Static image used in the hero and when 3D is unavailable. Re-render it if the scene changes. */
  sceneStill: 'assets/fallback/booth-overview.webp',
} as const

/** Resolves a file in /public against the Vite base path (works on GitHub Pages sub-paths). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
