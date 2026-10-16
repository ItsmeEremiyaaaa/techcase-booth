import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import QRCode from 'qrcode'
import { asset, site } from '../config/site'
import { trackTexture } from './shared'

const loadedUrls = new Set<string>()

/** Loads an image from /public as an sRGB texture (suspends until loaded). */
export function useImageTexture(path: string) {
  const url = asset(path)
  loadedUrls.add(url)
  const gl = useThree((s) => s.gl)
  const tex = useTexture(url)
  loadedTextures.add(tex)
  if (tex.colorSpace !== THREE.SRGBColorSpace) {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    tex.needsUpdate = true
  }
  return tex
}

const loadedTextures = new Set<THREE.Texture>()

/** Call when the scene unmounts: frees GPU memory and empties the loader cache. */
export function clearImageTextures() {
  loadedTextures.forEach((t) => t.dispose())
  loadedTextures.clear()
  loadedUrls.forEach((url) => useTexture.clear(url))
  loadedUrls.clear()
}

/* ---------------- Procedural maple floor ---------------- */
export function useWoodTexture(size: number) {
  const gl = useThree((s) => s.gl)
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    // one tile = 2 m × 2 m of floor, planks run along X (court length)
    const plankW = size / 28 // ~7 cm boards
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    ctx.fillStyle = '#D6A46A'
    ctx.fillRect(0, 0, size, size)
    for (let row = 0; row * plankW < size; row++) {
      let x = -rnd() * size * 0.4
      while (x < size) {
        const len = size * (0.25 + rnd() * 0.45)
        const l = 55 + rnd() * 10
        const h = 29 + rnd() * 6
        ctx.fillStyle = `hsl(${h} 56% ${l}%)`
        ctx.fillRect(x, row * plankW, len, plankW)
        // grain
        ctx.globalAlpha = 0.08
        for (let g = 0; g < 4; g++) {
          ctx.fillStyle = rnd() > 0.5 ? '#8a5a2b' : '#f2d2a2'
          ctx.fillRect(x, row * plankW + rnd() * plankW, len, Math.max(1, size / 1024))
        }
        ctx.globalAlpha = 1
        // seams
        ctx.fillStyle = 'rgba(90,55,25,0.35)'
        ctx.fillRect(x, row * plankW, Math.max(1, size / 1024), plankW)
        x += len
      }
      ctx.fillStyle = 'rgba(90,55,25,0.28)'
      ctx.fillRect(0, row * plankW, size, Math.max(1, size / 1024))
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    return trackTexture(t)
  }, [size, gl])
}

/* ---------------- QR sign texture ---------------- */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** A5/A3 portrait sign: header, QR generated from site.qrUrl, footer. */
export function useQrSignTexture() {
  return useMemo(() => {
    const W = 600
    const H = 850
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const t = trackTexture(new THREE.CanvasTexture(c))
    t.colorSpace = THREE.SRGBColorSpace
    const draw = () => {
      const ctx = c.getContext('2d')!
      ctx.fillStyle = '#1F4BD8'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#0B1B4D'
      ctx.fillRect(0, H - 120, W, 120)
      ctx.fillStyle = '#3FD0F0'
      ctx.fillRect(0, H - 130, W, 10)
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.font = '800 54px "Sora Variable", "Plus Jakarta Sans Variable", sans-serif'
      ctx.fillText('Scan to play', W / 2, 104)
      ctx.font = '800 64px "Sora Variable", "Plus Jakarta Sans Variable", sans-serif'
      ctx.fillText(site.appName, W / 2, 178)
      ctx.fillStyle = '#ffffff'
      roundRect(ctx, 80, 220, W - 160, W - 160, 28)
      ctx.fill()
      const qr = document.createElement('canvas')
      QRCode.toCanvas(qr, site.qrUrl, { margin: 1, width: W - 200, color: { dark: '#0B1B4D', light: '#ffffff' }, errorCorrectionLevel: 'M' }, () => {
        ctx.drawImage(qr, 100, 240, W - 200, W - 200)
        t.needsUpdate = true
      })
      ctx.fillStyle = '#ffffff'
      ctx.font = '700 30px "Plus Jakarta Sans Variable", sans-serif'
      ctx.fillText(`${site.eventName} · ${site.eventTagline}`, W / 2, H - 50)
      t.needsUpdate = true
    }
    draw()
    // redraw once the web fonts are ready so the sign uses the brand type
    document.fonts?.ready.then(draw).catch(() => undefined)
    return t
  }, [])
}

/* ---------------- Generic flat-colour panel with soft stripes (other booths) ---------------- */
export function usePanelTexture(a: string, b: string) {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 410
    const ctx = c.getContext('2d')!
    ctx.fillStyle = a
    ctx.fillRect(0, 0, 512, 410)
    ctx.fillStyle = b
    ctx.beginPath()
    ctx.arc(420, 120, 210, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    roundRect(ctx, 40, 60, 220, 34, 10)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    roundRect(ctx, 40, 110, 160, 20, 8)
    ctx.fill()
    roundRect(ctx, 40, 140, 190, 20, 8)
    ctx.fill()
    const t = trackTexture(new THREE.CanvasTexture(c))
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [a, b])
}
