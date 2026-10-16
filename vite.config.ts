import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages serves a project site from /<repository-name>/.
 * - The deploy workflow sets VITE_BASE to "/<repo>/" automatically.
 * - Locally, `npm run build` defaults to "/techcase-booth/".
 * - Use VITE_BASE=/ for a custom domain or a <user>.github.io repository.
 * - `npm run dev` serves from "/"; `npm run preview` uses the production base.
 */
const DEFAULT_BASE = '/techcase-booth/'

export default defineConfig(({ command, isPreview }) => {
  let base = command === 'serve' && !isPreview ? '/' : (process.env.VITE_BASE ?? DEFAULT_BASE)
  if (!base.startsWith('/') && !base.startsWith('.')) base = `/${base}`
  if (!base.endsWith('/')) base = `${base}/`

  return {
    base,
    plugins: [react()],
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id) || id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'react'
            if (id.includes('node_modules/three/')) return 'three'
            if (id.includes('@react-three') || id.includes('camera-controls') || id.includes('three-stdlib')) return 'r3f'
          },
        },
      },
    },
  }
})
