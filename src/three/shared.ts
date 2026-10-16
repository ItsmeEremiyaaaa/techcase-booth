import * as THREE from 'three'

/**
 * Shared geometries and materials, created once and reused by every instance
 * (people, chairs, stands…). Call disposeShared() when the 3D scene unmounts.
 */

const geoCache = new Map<string, THREE.BufferGeometry>()
const matCache = new Map<string, THREE.Material>()
const texCache = new Set<THREE.Texture>()

export function geo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined
  if (!g) {
    g = make()
    geoCache.set(key, g)
  }
  return g
}

interface MatOpts {
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  transparent?: boolean
  opacity?: number
  side?: THREE.Side
  envMapIntensity?: number
  flatShading?: boolean
}

export function mat(color: string, o: MatOpts = {}): THREE.MeshStandardMaterial {
  const key = `std|${color}|${JSON.stringify(o)}`
  let m = matCache.get(key) as THREE.MeshStandardMaterial | undefined
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.roughness ?? 0.7,
      metalness: o.metalness ?? 0,
      emissive: o.emissive ?? '#000000',
      emissiveIntensity: o.emissiveIntensity ?? 1,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      side: o.side ?? THREE.FrontSide,
      envMapIntensity: o.envMapIntensity ?? 1,
      flatShading: o.flatShading ?? false,
    })
    matCache.set(key, m)
  }
  return m
}

export function basic(color: string, o: { transparent?: boolean; opacity?: number; toneMapped?: boolean; side?: THREE.Side } = {}) {
  const key = `basic|${color}|${JSON.stringify(o)}`
  let m = matCache.get(key) as THREE.MeshBasicMaterial | undefined
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: o.transparent ?? false, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide })
    m.toneMapped = o.toneMapped ?? true
    matCache.set(key, m)
  }
  return m
}

/** Registers a texture created by code (canvas textures) for disposal. */
export function trackTexture<T extends THREE.Texture>(t: T): T {
  texCache.add(t)
  return t
}

export function disposeShared() {
  geoCache.forEach((g) => g.dispose())
  geoCache.clear()
  matCache.forEach((m) => m.dispose())
  matCache.clear()
  texCache.forEach((t) => t.dispose())
  texCache.clear()
}

/* ---------- Brand palette (3D) ---------- */
export const C = {
  royal: '#1F4BD8',
  royalDeep: '#173AA8',
  navy: '#0B1B4D',
  cyan: '#3FD0F0',
  white: '#F7F9FC',
  aluminium: '#C9CED6',
  charcoal: '#22262E',
  wall: '#E4E9F1',
  wallBand: '#1F4BD8',
  wood: '#D9A86C',
  orange: '#E9935B',
  cream: '#FCF1E3',
}
