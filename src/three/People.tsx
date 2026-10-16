import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { basic, geo, mat } from './shared'
import { useImageTexture } from './textures'
import { BLEACHER } from './Court'

/* Stylized procedural people: shared geometry, cached materials, light idle motion. */

export type Pose = 'stand' | 'phone' | 'scan' | 'present' | 'talk' | 'crossed' | 'lean' | 'pockets' | 'wave'
export type HairStyle = 'short' | 'long' | 'bun' | 'buzz' | 'cap' | 'ponytail'

export interface PersonProps {
  position: [number, number, number]
  rotation?: number
  scale?: number
  skin: string
  hair: string
  hairStyle?: HairStyle
  top: string
  bottom: string
  shoes?: string
  longSleeves?: boolean
  pose?: Pose
  headYaw?: number
  headPitch?: number
  backpack?: string
  lanyard?: boolean
  rep?: boolean
  phase?: number
  animate?: boolean
  castShadow?: boolean
}

type ArmPose = [number, number, number] // upper.x, upper.z, elbow.x
const POSES: Record<Pose, { r: ArmPose; l: ArmPose; lean?: number }> = {
  stand: { r: [0.02, -0.08, -0.15], l: [0.02, 0.08, -0.15] },
  phone: { r: [-0.5, -0.05, -1.25], l: [-0.42, 0.2, -1.15] },
  scan: { r: [-1.15, -0.12, -0.3], l: [0.02, 0.08, -0.2] },
  present: { r: [-0.8, -0.35, -0.45], l: [0.02, 0.1, -0.25] },
  talk: { r: [-0.25, -0.12, -1.1], l: [-0.1, 0.12, -0.6] },
  crossed: { r: [-0.4, 0.42, -1.85], l: [-0.32, -0.42, -1.85] },
  lean: { r: [-0.75, -0.04, -0.15], l: [-0.75, 0.04, -0.15], lean: 0.2 },
  pockets: { r: [0.1, -0.18, -0.35], l: [0.1, 0.18, -0.35] },
  wave: { r: [-0.2, -2.6, -0.4], l: [0.02, 0.08, -0.15] },
}

function useBodyGeometry() {
  return useMemo(
    () => ({
      leg: geo('p-leg', () => new THREE.CapsuleGeometry(0.068, 0.72, 4, 12)),
      shoe: geo('p-shoe', () => new RoundedBoxGeometry(0.11, 0.07, 0.25, 2, 0.03)),
      torso: geo('p-torso', () => new THREE.CapsuleGeometry(0.16, 0.36, 6, 16)),
      neck: geo('p-neck', () => new THREE.CylinderGeometry(0.048, 0.052, 0.1, 10)),
      head: geo('p-head', () => new THREE.SphereGeometry(0.115, 28, 20)),
      hairCap: geo('p-hair', () => new THREE.SphereGeometry(0.124, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.56)),
      hairLong: geo('p-hairlong', () => new THREE.CapsuleGeometry(0.1, 0.18, 4, 12)),
      bun: geo('p-bun', () => new THREE.SphereGeometry(0.058, 12, 10)),
      brim: geo('p-brim', () => new THREE.CylinderGeometry(0.1, 0.1, 0.012, 16, 1, false, -Math.PI / 2, Math.PI)),
      upper: geo('p-upper', () => new THREE.CapsuleGeometry(0.052, 0.22, 4, 10)),
      fore: geo('p-fore', () => new THREE.CapsuleGeometry(0.044, 0.2, 4, 10)),
      hand: geo('p-hand', () => new THREE.SphereGeometry(0.048, 10, 8)),
      eye: geo('p-eye', () => new THREE.SphereGeometry(0.012, 6, 6)),
      pack: geo('p-pack', () => new RoundedBoxGeometry(0.28, 0.36, 0.14, 2, 0.04)),
      card: geo('p-card', () => new THREE.BoxGeometry(0.065, 0.09, 0.006)),
      strap: geo('p-strap', () => new THREE.BoxGeometry(0.012, 0.2, 0.004)),
      phone: geo('p-phone', () => new RoundedBoxGeometry(0.072, 0.148, 0.009, 2, 0.004)),
      phoneScreen: geo('p-phone-screen', () => new THREE.PlaneGeometry(0.064, 0.138)),
      patch: geo('p-patch', () => new THREE.PlaneGeometry(0.06, 0.06)),
    }),
    [],
  )
}

function HeldPhone({ screen }: { screen: THREE.Texture }) {
  const g = useBodyGeometry()
  return (
    <group position={[0, -0.31, 0.03]} rotation={[-1.2, 0, 0]}>
      <mesh geometry={g.phone} material={mat('#14171F', { roughness: 0.3, metalness: 0.4 })} castShadow />
      <mesh geometry={g.phoneScreen} position={[0, 0, 0.0052]}>
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Person(p: PersonProps) {
  const g = useBodyGeometry()
  const pose = POSES[p.pose ?? 'stand']
  const upperBody = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const rArm = useRef<THREE.Group>(null)
  const lArm = useRef<THREE.Group>(null)
  const rFore = useRef<THREE.Group>(null)
  const lFore = useRef<THREE.Group>(null)
  const screen = useImageTexture('assets/screens/home.webp')
  const holdsPhone = p.pose === 'phone' || p.pose === 'scan'
  const shadow = p.castShadow ?? true

  const skin = mat(p.skin, { roughness: 0.65 })
  const hair = mat(p.hair, { roughness: 0.85 })
  const top = mat(p.top, { roughness: 0.8 })
  const bottom = mat(p.bottom, { roughness: 0.85 })
  const shoes = mat(p.shoes ?? '#2A2D35', { roughness: 0.6 })
  const sleeve = p.longSleeves ? top : skin
  const lean = pose.lean ?? 0
  const headPitch = (p.headPitch ?? 0) + (holdsPhone && p.pose === 'phone' ? 0.38 : 0)
  const phase = p.phase ?? 0

  useFrame(({ clock }) => {
    if (!p.animate) return
    const t = clock.elapsedTime + phase
    if (upperBody.current) {
      upperBody.current.rotation.x = lean + Math.sin(t * 1.3) * 0.012
      upperBody.current.rotation.z = Math.sin(t * 0.6) * 0.012
    }
    if (head.current) {
      const look = p.pose === 'phone' ? 0.05 : 0.16
      head.current.rotation.y = (p.headYaw ?? 0) + Math.sin(t * 0.45) * look
      head.current.rotation.x = headPitch + Math.sin(t * 0.7) * 0.025
    }
    if (p.pose === 'talk') {
      if (rFore.current) rFore.current.rotation.x = pose.r[2] + Math.sin(t * 2.1) * 0.22
      if (lFore.current) lFore.current.rotation.x = pose.l[2] + Math.sin(t * 1.6 + 1) * 0.15
    } else if (p.pose === 'present') {
      if (rArm.current) rArm.current.rotation.x = pose.r[0] + Math.sin(t * 1.1) * 0.1
      if (rFore.current) rFore.current.rotation.x = pose.r[2] + Math.sin(t * 1.1 + 0.6) * 0.12
    } else if (p.pose === 'wave') {
      if (rFore.current) rFore.current.rotation.z = Math.sin(t * 5) * 0.35
    }
  })

  const arm = (side: 1 | -1) => {
    const ap = side === -1 ? pose.r : pose.l
    return (
      <group ref={side === -1 ? rArm : lArm} position={[side * 0.205, 1.43 - 0.88, 0]} rotation={[ap[0], 0, ap[1]]}>
        <mesh geometry={g.upper} material={top} position={[0, -0.15, 0]} castShadow={shadow} />
        <group ref={side === -1 ? rFore : lFore} position={[0, -0.3, 0]} rotation={[ap[2], 0, 0]}>
          <mesh geometry={g.fore} material={sleeve} position={[0, -0.13, 0]} castShadow={shadow} />
          <mesh geometry={g.hand} material={skin} position={[0, -0.28, 0]} />
          {side === -1 && holdsPhone && <HeldPhone screen={screen} />}
        </group>
      </group>
    )
  }

  const hs = p.hairStyle ?? 'short'
  return (
    <group position={p.position} rotation={[0, p.rotation ?? 0, 0]} scale={p.scale ?? 1}>
      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={g.leg} material={bottom} position={[s * 0.092, 0.47, 0]} castShadow={shadow} />
          <mesh geometry={g.shoe} material={shoes} position={[s * 0.092, 0.035, 0.04]} castShadow={shadow} />
        </group>
      ))}
      {/* upper body pivots at the hips */}
      <group ref={upperBody} position={[0, 0.88, 0]} rotation={[lean, 0, 0]}>
        <mesh geometry={g.torso} material={top} position={[0, 0.3, 0]} scale={[1.18, 1, 0.74]} castShadow={shadow} />
        <mesh geometry={g.neck} material={skin} position={[0, 0.66, 0]} />
        <group ref={head} position={[0, 0.78, 0]} rotation={[headPitch, p.headYaw ?? 0, 0]}>
          <mesh geometry={g.head} material={skin} scale={[1, 1.08, 1]} castShadow={shadow} />
          {hs !== 'buzz' && <mesh geometry={g.hairCap} material={hair} position={[0, 0.012, -0.012]} rotation={[-0.25, 0, 0]} />}
          {hs === 'buzz' && <mesh geometry={g.hairCap} material={hair} position={[0, 0.004, -0.004]} scale={0.96} rotation={[-0.15, 0, 0]} />}
          {hs === 'long' && <mesh geometry={g.hairLong} material={hair} position={[0, -0.1, -0.06]} scale={[1.15, 1, 0.55]} />}
          {hs === 'ponytail' && <mesh geometry={g.hairLong} material={hair} position={[0, -0.06, -0.12]} scale={[0.45, 0.8, 0.45]} rotation={[0.35, 0, 0]} />}
          {hs === 'bun' && <mesh geometry={g.bun} material={hair} position={[0, 0.1, -0.08]} />}
          {hs === 'cap' && (
            <>
              <mesh geometry={g.hairCap} material={mat(p.top === '#1F4BD8' ? '#0B1B4D' : '#1F4BD8', { roughness: 0.7 })} position={[0, 0.02, -0.006]} scale={1.03} rotation={[-0.15, 0, 0]} />
              <mesh geometry={g.brim} material={mat('#0B1B4D', { roughness: 0.7 })} position={[0, 0.045, 0.1]} rotation={[0.12, 0, 0]} />
            </>
          )}
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={g.eye} material={basic('#1B1B22')} position={[s * 0.04, 0.012, 0.105]} />
          ))}
        </group>
        {arm(-1)}
        {arm(1)}
        {p.backpack && <mesh geometry={g.pack} material={mat(p.backpack, { roughness: 0.75 })} position={[0, 0.34, -0.17]} castShadow={shadow} />}
        {p.lanyard && (
          <group position={[0, 0.38, 0.122]}>
            <mesh geometry={g.strap} material={basic('#3FD0F0')} position={[-0.045, 0.12, 0]} rotation={[0, 0, -0.35]} />
            <mesh geometry={g.strap} material={basic('#3FD0F0')} position={[0.045, 0.12, 0]} rotation={[0, 0, 0.35]} />
            <mesh geometry={g.card} material={basic('#F7F9FC')} position={[0, -0.02, 0.004]} />
          </group>
        )}
        {p.rep && <mesh geometry={g.patch} material={basic('#FFFFFF')} position={[0.075, 0.47, 0.121]} scale={[0.7, 0.45, 1]} />}
      </group>
    </group>
  )
}

/* ---------- Seated spectators on the bleachers (instanced: 3 draw calls) ---------- */
function buildSeatedLegs() {
  const thighs = new THREE.BoxGeometry(0.3, 0.13, 0.44).translate(0, 0.065, 0.2)
  const shins = new THREE.BoxGeometry(0.28, 0.46, 0.13).translate(0, -0.2, 0.38)
  const g = mergeGeometries([thighs, shins])!
  thighs.dispose()
  shins.dispose()
  return g
}

export function BleacherCrowd({ count }: { count: number }) {
  const body = useRef<THREE.InstancedMesh>(null)
  const legs = useRef<THREE.InstancedMesh>(null)
  const heads = useRef<THREE.InstancedMesh>(null)
  const bodyGeo = useMemo(() => geo('crowd-body', () => new THREE.CapsuleGeometry(0.16, 0.3, 4, 12)), [])
  const legGeo = useMemo(() => geo('crowd-legs', buildSeatedLegs), [])
  const headGeo = useMemo(() => geo('crowd-head', () => new THREE.SphereGeometry(0.11, 14, 12)), [])
  const white = useMemo(() => mat('#ffffff', { roughness: 0.8 }), [])

  useLayoutEffect(() => {
    if (!body.current || !heads.current || !legs.current) return
    const shirts = ['#1F4BD8', '#F7F9FC', '#2E3440', '#E9935B', '#5BA79A', '#B7C4DE', '#8E7DC9', '#D9534A', '#F1C453']
    const pants = ['#22262E', '#2F3A55', '#3B4A6B', '#5C6678', '#1E2230']
    const skins = ['#8D5A3B', '#C68A62', '#E0B08A', '#A86F4C', '#F0C9A6', '#6E432B']
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const one = new THREE.Vector3(1, 1, 1)
    let seed = 11
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const { rows, len, depth, rise, z0, x } = BLEACHER
    // spread people over seats without overlaps: pick distinct seat slots
    const slotsPerRow = Math.floor((len - 1.2) / 0.62)
    const slots: [number, number][] = []
    for (let r = 1; r < rows; r++) for (let k = 0; k < slotsPerRow; k++) slots.push([r, k])
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[slots[i], slots[j]] = [slots[j], slots[i]]
    }
    const n = Math.min(count, slots.length)
    for (let i = 0; i < n; i++) {
      const [r, k] = slots[i]
      const seatY = rise * (r + 1) + 0.06
      const z = z0 + (rows - 1 - r) * depth + depth / 2 + 0.02
      const px = x - len / 2 + 0.6 + k * 0.62 + (rnd() - 0.5) * 0.12
      const yaw = (rnd() - 0.5) * 0.5
      q.setFromEuler(e.set(-0.06, yaw, 0))
      m.compose(new THREE.Vector3(px, seatY + 0.3, z), q, new THREE.Vector3(1.12, 1, 0.78))
      body.current.setMatrixAt(i, m)
      body.current.setColorAt(i, c.set(shirts[Math.floor(rnd() * shirts.length)]))
      m.compose(new THREE.Vector3(px, seatY, z), q.setFromEuler(e.set(0, yaw, 0)), one)
      legs.current.setMatrixAt(i, m)
      legs.current.setColorAt(i, c.set(pants[Math.floor(rnd() * pants.length)]))
      m.compose(new THREE.Vector3(px, seatY + 0.7, z + 0.02), q, new THREE.Vector3(1, 1.08, 1))
      heads.current.setMatrixAt(i, m)
      heads.current.setColorAt(i, c.set(skins[Math.floor(rnd() * skins.length)]))
    }
    for (const im of [body.current, legs.current, heads.current]) {
      im.count = n
      im.instanceMatrix.needsUpdate = true
      if (im.instanceColor) im.instanceColor.needsUpdate = true
      im.computeBoundingSphere()
    }
  }, [count])

  if (count <= 0) return null
  return (
    <group>
      <instancedMesh ref={body} args={[bodyGeo, white, count]} castShadow receiveShadow />
      <instancedMesh ref={legs} args={[legGeo, white, count]} castShadow receiveShadow />
      <instancedMesh ref={heads} args={[headGeo, white, count]} castShadow />
    </group>
  )
}
