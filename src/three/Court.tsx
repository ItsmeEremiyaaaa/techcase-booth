import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MeshReflectorMaterial, RoundedBox } from '@react-three/drei'
import type { Quality } from '../lib/store'
import { useImageTexture, useWoodTexture } from './textures'
import { C, basic, geo, mat } from './shared'

/** Gym interior: 36 × 24 m floor around a 28 × 15 m FIBA court, origin at centre court. */
export const GYM = { w: 36, d: 24, h: 8 }
const COURT = { L: 28, W: 15 }
const LINE = 0.05

function strip(x1: number, z1: number, x2: number, z2: number, w = LINE) {
  const len = Math.hypot(x2 - x1, z2 - z1)
  const g = new THREE.PlaneGeometry(len, w)
  g.rotateX(-Math.PI / 2)
  g.rotateY(-Math.atan2(z2 - z1, x2 - x1))
  g.translate((x1 + x2) / 2, 0, (z1 + z2) / 2)
  return g
}

function arc(cx: number, cz: number, r: number, start: number, length: number, w = LINE) {
  const g = new THREE.RingGeometry(r - w, r, 96, 1, start, length)
  g.rotateX(-Math.PI / 2)
  g.translate(cx, 0, cz)
  return g
}

function buildLines() {
  const hl = COURT.L / 2
  const hw = COURT.W / 2
  const parts: THREE.BufferGeometry[] = [
    strip(-hl, -hw + LINE / 2, hl, -hw + LINE / 2),
    strip(-hl, hw - LINE / 2, hl, hw - LINE / 2),
    strip(-hl + LINE / 2, -hw, -hl + LINE / 2, hw),
    strip(hl - LINE / 2, -hw, hl - LINE / 2, hw),
    strip(0, -hw, 0, hw),
    arc(0, 0, 1.8, 0, Math.PI * 2),
  ]
  for (const s of [-1, 1]) {
    const base = s * hl
    const ft = s * (hl - 5.8)
    const basket = s * (hl - 1.575)
    // key
    parts.push(strip(base, -2.45, ft, -2.45), strip(base, 2.45, ft, 2.45), strip(ft, -2.45, ft, 2.45))
    parts.push(arc(ft, 0, 1.8, 0, Math.PI * 2))
    // three-point line
    const meet = Math.sqrt(6.75 * 6.75 - 6.6 * 6.6)
    parts.push(strip(base, -6.6, basket - s * meet, -6.6), strip(base, 6.6, basket - s * meet, 6.6))
    const a = Math.asin(6.6 / 6.75)
    // RingGeometry angles are measured in the XY plane before rotateX(-90°): +Y becomes -Z
    if (s > 0) parts.push(arc(basket, 0, 6.75, Math.PI - a, a * 2))
    else parts.push(arc(basket, 0, 6.75, -a, a * 2))
    // no-charge semicircle
    if (s > 0) parts.push(arc(basket, 0, 1.25 + LINE, Math.PI / 2, Math.PI))
    else parts.push(arc(basket, 0, 1.25 + LINE, -Math.PI / 2, Math.PI))
  }
  const merged = mergeGeometries(parts)!
  parts.forEach((p) => p.dispose())
  return merged
}

function buildPaint() {
  const hl = COURT.L / 2
  const parts: THREE.BufferGeometry[] = []
  for (const s of [-1, 1]) {
    const g = new THREE.PlaneGeometry(5.8, 4.9)
    g.rotateX(-Math.PI / 2)
    g.translate(s * (hl - 2.9), 0, 0)
    parts.push(g)
  }
  const c = new THREE.CircleGeometry(1.8 - LINE, 64)
  c.rotateX(-Math.PI / 2)
  parts.push(c)
  const merged = mergeGeometries(parts)!
  parts.forEach((p) => p.dispose())
  return merged
}

function Floor({ quality }: { quality: Quality }) {
  const wood = useWoodTexture(quality === 'low' ? 512 : 1024)
  const map = useMemo(() => {
    wood.repeat.set(GYM.w / 2, GYM.d / 2)
    wood.needsUpdate = true
    return wood
  }, [wood])
  const lines = useMemo(() => geo('court-lines', buildLines), [])
  const paint = useMemo(() => geo('court-paint', buildPaint), [])
  const floorGeo = useMemo(() => geo('floor', () => new THREE.PlaneGeometry(GYM.w, GYM.d).rotateX(-Math.PI / 2)), [])

  return (
    <group>
      {/* diorama slab */}
      <mesh position={[0, -0.195, 0]} receiveShadow>
        <boxGeometry args={[GYM.w + 0.4, 0.36, GYM.d + 0.4]} />
        <meshStandardMaterial color="#C9D2E3" roughness={0.9} />
      </mesh>
      <mesh geometry={floorGeo} receiveShadow name="floor">
        {quality === 'high' ? (
          <MeshReflectorMaterial
            map={map}
            color="#ffffff"
            roughness={0.42}
            metalness={0}
            blur={[260, 80]}
            resolution={512}
            mixBlur={1}
            mixStrength={0.55}
            mirror={0.35}
            depthScale={0.6}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
          />
        ) : (
          <meshStandardMaterial map={map} roughness={0.38} envMapIntensity={0.8} />
        )}
      </mesh>
      {/* royal-blue paint (keys + centre circle) */}
      <mesh geometry={paint} position={[0, 0.003, 0]} receiveShadow>
        <meshStandardMaterial color={C.royal} roughness={0.45} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <mesh geometry={lines} position={[0, 0.006, 0]} receiveShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  )
}

function Hoop({ side }: { side: 1 | -1 }) {
  const hl = COURT.L / 2
  const pad = mat(C.royal, { roughness: 0.6 })
  const steel = mat('#3A3F4A', { roughness: 0.4, metalness: 0.6 })
  const x = side * (hl + 1.6)
  return (
    <group>
      {/* portable base */}
      <RoundedBox args={[1.6, 0.55, 1.4]} radius={0.12} position={[x + side * 0.2, 0.28, 0]} material={pad} castShadow receiveShadow />
      <mesh position={[x, 2.0, 0]} material={steel} castShadow>
        <boxGeometry args={[0.16, 3.1, 0.16]} />
      </mesh>
      <mesh position={[side * (hl + 0.2), 3.45, 0]} material={steel} castShadow>
        <boxGeometry args={[2.8, 0.12, 0.12]} />
      </mesh>
      {/* backboard */}
      <group position={[side * (hl - 1.2), 3.43, 0]} rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.05, 0.03]} />
          <meshPhysicalMaterial color="#E8F2FF" transparent opacity={0.3} roughness={0.05} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.12, 0.02]} rotation={[0, 0, Math.PI / 4]} material={basic('#ffffff')}>
          <ringGeometry args={[0.3, 0.335, 4, 1]} />
        </mesh>
        {[0.5, -0.5].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={basic('#ffffff')}>
            <boxGeometry args={[1.8, 0.05, 0.04]} />
          </mesh>
        ))}
        {[0.88, -0.88].map((xx) => (
          <mesh key={xx} position={[xx, 0, 0]} material={basic('#ffffff')}>
            <boxGeometry args={[0.05, 1.05, 0.04]} />
          </mesh>
        ))}
      </group>
      {/* rim + net */}
      <mesh position={[side * (hl - 1.575), 3.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={mat('#F06A21', { roughness: 0.4, metalness: 0.3 })}>
        <torusGeometry args={[0.225, 0.012, 8, 32]} />
      </mesh>
      <mesh position={[side * (hl - 1.575), 2.84, 0]}>
        <cylinderGeometry args={[0.225, 0.15, 0.4, 12, 3, true]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function Walls() {
  const wall = mat(C.wall, { roughness: 0.92 })
  const band = mat(C.wallBand, { roughness: 0.8 })
  const glassMat = mat('#DCEBFF', { emissive: '#CFE4FF', emissiveIntensity: 0.9, roughness: 0.2 })
  const banner = useImageTexture('assets/textures/wallbanner.webp')
  const score = useImageTexture('assets/textures/scoreboard.webp')
  const walls: { pos: [number, number, number]; rot: number; len: number }[] = [
    { pos: [0, GYM.h / 2, -GYM.d / 2], rot: 0, len: GYM.w },
    { pos: [-GYM.w / 2, GYM.h / 2, 0], rot: Math.PI / 2, len: GYM.d },
    { pos: [GYM.w / 2, GYM.h / 2, 0], rot: -Math.PI / 2, len: GYM.d },
    { pos: [0, GYM.h / 2, GYM.d / 2], rot: Math.PI, len: GYM.w },
  ]
  return (
    <group>
      {walls.map((w, i) => (
        // single-sided planes facing inward: from outside they disappear, giving a cut-away diorama view
        <group key={i} position={w.pos} rotation={[0, w.rot, 0]}>
          <mesh material={wall} receiveShadow>
            <planeGeometry args={[w.len, GYM.h]} />
          </mesh>
          <mesh position={[0, -GYM.h / 2 + 0.7, 0.01]} material={band} receiveShadow>
            <planeGeometry args={[w.len, 1.4]} />
          </mesh>
          <mesh position={[0, -GYM.h / 2 + 1.45, 0.012]} material={basic(C.cyan)}>
            <planeGeometry args={[w.len, 0.1]} />
          </mesh>
          {/* clerestory windows */}
          {Array.from({ length: Math.floor(w.len / 3) }, (_, k) => (
            <mesh key={k} position={[-w.len / 2 + 1.5 + k * 3, 2.6, 0.02]} material={glassMat}>
              <planeGeometry args={[2.2, 1.1]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* event banner on the back wall */}
      <mesh position={[0, 5.2, -GYM.d / 2 + 0.03]}>
        <planeGeometry args={[7.5, 1.5]} />
        <meshStandardMaterial map={banner} roughness={0.8} />
      </mesh>
      {/* scoreboard on the left wall */}
      <group position={[-GYM.w / 2 + 0.18, 5.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={mat('#15181F', { roughness: 0.5 })} castShadow>
          <boxGeometry args={[3.4, 1.8, 0.3]} />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <planeGeometry args={[3.1, 1.55]} />
          <meshBasicMaterial map={score} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

export const BLEACHER = { rows: 5, len: 22, x: 2, depth: 0.8, rise: 0.45, z0: -GYM.d / 2 + 0.2 }

function Bleachers({ quality }: { quality: Quality }) {
  const { rows, len, depth, rise, z0, x } = BLEACHER
  const step = mat('#9AA6BA', { roughness: 0.7 })
  const seat = mat(C.royal, { roughness: 0.55 })
  return (
    <group position={[x, 0, 0]}>
      {Array.from({ length: rows }, (_, r) => {
        const h = rise * (r + 1)
        const z = z0 + (rows - 1 - r) * depth + depth / 2
        return (
          <group key={r}>
            <mesh position={[0, h / 2, z]} material={step} castShadow={quality !== 'low'} receiveShadow>
              <boxGeometry args={[len, h, depth]} />
            </mesh>
            <mesh position={[0, h + 0.03, z + 0.12]} material={seat} receiveShadow>
              <boxGeometry args={[len, 0.06, 0.4]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function Court({ quality }: { quality: Quality }) {
  return (
    <group>
      <Floor quality={quality} />
      <Hoop side={-1} />
      <Hoop side={1} />
      <Walls />
      <Bleachers quality={quality} />
    </group>
  )
}
