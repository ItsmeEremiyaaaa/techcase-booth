import type { Quality } from './store'

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    const ok = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

/** Picks a starting quality from coarse device signals; PerformanceMonitor refines DPR at runtime. */
export function detectQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const mem = nav.deviceMemory ?? 4
  const cores = nav.hardwareConcurrency ?? 4
  const minSide = Math.min(window.screen.width, window.screen.height)
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const saveData = (nav as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  if (saveData || mem <= 2 || cores <= 2) return 'low'
  if (coarse || minSide < 600 || mem <= 4 || cores <= 4) return 'medium'
  return 'high'
}
