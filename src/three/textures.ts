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

/** A5/A3 portrait sign in the StudyQuest style; the QR code is generated from site.qrUrl. */
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
      const display = '"Fredoka Variable", "Nunito Variable", sans-serif'
      // StudyQuest look: cream card, purple tag, brown title, orange scan brackets
      ctx.fillStyle = '#FFF6EC'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#E8935C'
      ctx.beginPath()
      ctx.arc(W - 40, 40, 170, 0, Math.PI * 2)
      ctx.fill()
      ctx.textAlign = 'center'
      ctx.fillStyle = '#5B3FC0'
      roundRect(ctx, 150, 44, 300, 52, 26)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `700 26px ${display}`
      ctx.fillText('START YOUR QUEST', W / 2, 80)
      ctx.fillStyle = '#2B1D14'
      ctx.font = `700 58px ${display}`
      ctx.fillText('Scan to play', W / 2, 162)
      ctx.fillStyle = '#FFFFFF'
      roundRect(ctx, 90, 200, W - 180, W - 180, 34)
      ctx.fill()
      // orange corner brackets
      ctx.strokeStyle = '#E8935C'
      ctx.lineWidth = 12
      ctx.lineCap = 'round'
      const L = 70
      const x0 = 110
      const y0 = 220
      const x1 = W - 110
      const y1 = 200 + W - 180 - 20
      for (const [x, y, dx, dy] of [
        [x0, y0, 1, 1],
        [x1, y0, -1, 1],
        [x0, y1, 1, -1],
        [x1, y1, -1, -1],
      ]) {
        ctx.beginPath()
        ctx.moveTo(x, y + dy * L)
        ctx.lineTo(x, y)
        ctx.lineTo(x + dx * L, y)
        ctx.stroke()
      }
      const qr = document.createElement('canvas')
      QRCode.toCanvas(qr, site.qrUrl, { margin: 1, width: W - 260, color: { dark: '#2B1D14', light: '#ffffff' }, errorCorrectionLevel: 'M' }, () => {
        ctx.drawImage(qr, 130, 240, W - 260, W - 260)
        t.needsUpdate = true
      })
      ctx.fillStyle = '#B4531E'
      ctx.font = `700 34px ${display}`
      ctx.fillText(site.qrUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''), W / 2, 668)
      ctx.fillStyle = '#2B1D14'
      ctx.fillRect(0, H - 120, W, 120)
      ctx.font = `700 44px ${display}`
      const parts: [string, string][] = [
        ['Study. ', '#FFF6EC'],
        ['Compete. ', '#F2B48B'],
        ['Level Up.', '#F2B33D'],
      ]
      const total = parts.reduce((n, [txt]) => n + ctx.measureText(txt).width, 0)
      let x = (W - total) / 2
      ctx.textAlign = 'left'
      for (const [txt, col] of parts) {
        ctx.fillStyle = col
        ctx.fillText(txt, x, H - 46)
        x += ctx.measureText(txt).width
      }
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
