import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { basic, geo, mat } from './shared'
import { useImageTexture } from './textures'
import { Hl } from './Interactive'
import { BLEACHER } from './Court'

/* Stylized procedural people: shared geometry, cached materials, smooth pose blending and a walk cycle. */

export type Pose =
  | 'stand'
  | 'walk'
  | 'phone'
  | 'scan'
  | 'present'
  | 'talk'
  | 'crossed'
  | 'lean'
  | 'pockets'
  | 'wave'
  | 'point'
  | 'read'
  | 'reach'
  | 'clipboard'
export type HairStyle = 'short' | 'long' | 'bun' | 'buzz' | 'cap' | 'ponytail' | 'curly' | 'side'
/** casual clothes, or the SMCBI school uniform (men: light blue polo + dark slacks; women: white blouse + navy tie) */
export type Outfit = 'casual' | 'smcbi-m' | 'smcbi-f'

/** Shared with a walker: its current speed in m/s drives the walk cycle. */
export interface Gait {
  speed: number
}

export const UNIFORM = {
  shirt: '#9DB5EA',
  shirtShade: '#8EA7DE',
  collar: '#B2C5F0',
  slacks: '#1C2130',
  shoes: '#15171C',
  blouse: '#F6F7FA',
  tie: '#1E2A4A',
  skirt: '#24304F',
  seal: '#173A5E',
}

export interface PersonProps {
  position: [number, number, number]
  rotation?: number
  scale?: number
  skin: string
  hair: string
  hairStyle?: HairStyle
  /** shirt colour (ignored for uniforms) */
  top?: string
  /** trousers colour (ignored for uniforms) */
  bottom?: string
  shoes?: string
  longSleeves?: boolean
  outfit?: Outfit
  pose?: Pose
  headYaw?: number
  headPitch?: number
  backpack?: string
  lanyard?: boolean
  lanyardColor?: string
  phase?: number
  animate?: boolean
  castShadow?: boolean
  gait?: MutableRefObject<Gait>
  /**
   * Hide this person while the camera is closer than this (metres) to them, so close-up views
   * don't fill the screen with a passer-by. Hidden people also stop catching clicks. 0 = never.
   */
  nearHide?: number
}

/** layer that neither the camera nor the pointer raycaster looks at */
const HIDDEN_LAYER = 5
const _pos = new THREE.Vector3()

type ArmPose = [number, number, number] // upper.x, upper.z, elbow.x  (negative x = forward)
const POSES: Record<Pose, { r: ArmPose; l: ArmPose; lean?: number; pitch?: number }> = {
  stand: { r: [0.02, -0.08, -0.15], l: [0.02, 0.08, -0.15] },
  walk: { r: [0.02, -0.07, -0.2], l: [0.02, 0.07, -0.2] },
  phone: { r: [-0.5, -0.05, -1.25], l: [-0.42, 0.2, -1.15], pitch: 0.38 },
  scan: { r: [-1.15, -0.12, -0.3], l: [0.02, 0.08, -0.2] },
  present: { r: [-0.8, -0.35, -0.45], l: [0.02, 0.1, -0.25] },
  talk: { r: [-0.25, -0.12, -1.1], l: [-0.1, 0.12, -0.6] },
  crossed: { r: [-0.4, 0.42, -1.85], l: [-0.32, -0.42, -1.85] },
  lean: { r: [-0.75, -0.04, -0.15], l: [-0.75, 0.04, -0.15], lean: 0.22, pitch: 0.2 },
  pockets: { r: [0.1, -0.18, -0.35], l: [0.1, 0.18, -0.35] },
  wave: { r: [-0.2, -2.6, -0.4], l: [0.02, 0.08, -0.15] },
  point: { r: [-1.45, -0.18, -0.05], l: [0.02, 0.08, -0.15], pitch: -0.12 },
  read: { r: [-0.5, 0.2, -1.2], l: [-0.5, -0.2, -1.2], pitch: 0.38 },
  reach: { r: [-1.0, -0.02, -0.3], l: [0.0, 0.1, -0.2], lean: 0.3, pitch: 0.35 },
  clipboard: { r: [-0.45, 0.08, -1.4], l: [-0.32, 0.24, -1.6], pitch: 0.28 },
}
/** poses whose arms swing freely when walking (others keep holding things) */
const SWING = new Set<Pose>(['stand', 'walk', 'wave'])

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
      curl: geo('p-curl', () => new THREE.SphereGeometry(0.046, 10, 8)),
      brim: geo('p-brim', () => new THREE.CylinderGeometry(0.1, 0.1, 0.012, 16, 1, false, -Math.PI / 2, Math.PI)),
      upper: geo('p-upper', () => new THREE.CapsuleGeometry(0.052, 0.22, 4, 10)),
      sleeve: geo('p-sleeve', () => new THREE.CylinderGeometry(0.068, 0.062, 0.2, 12)),
      shoulder: geo('p-shoulder', () => new THREE.SphereGeometry(0.07, 14, 10)),
      fore: geo('p-fore', () => new THREE.CapsuleGeometry(0.044, 0.2, 4, 10)),
      hand: geo('p-hand', () => new THREE.SphereGeometry(0.048, 10, 8)),
      eye: geo('p-eye', () => new THREE.SphereGeometry(0.012, 6, 6)),
      pack: geo('p-pack', () => new RoundedBoxGeometry(0.28, 0.36, 0.14, 2, 0.04)),
      card: geo('p-card', () => new THREE.BoxGeometry(0.065, 0.09, 0.006)),
      strap: geo('p-strap', () => new THREE.BoxGeometry(0.012, 0.2, 0.004)),
      phone: geo('p-phone', () => new RoundedBoxGeometry(0.072, 0.148, 0.009, 2, 0.004)),
      phoneScreen: geo('p-phone-screen', () => new THREE.PlaneGeometry(0.064, 0.138)),
      brochure: geo('p-brochure', () => new THREE.BoxGeometry(0.093, 0.216, 0.004)),
      brochureFace: geo('p-brochure-face', () => new THREE.PlaneGeometry(0.093, 0.216)),
      clipboard: geo('p-clipboard', () => new THREE.BoxGeometry(0.17, 0.23, 0.008)),
      paper: geo('p-paper', () => new THREE.PlaneGeometry(0.15, 0.19)),
      // uniform details
      vee: geo('p-vee', () => new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-0.036, 0.035), new THREE.Vector2(0.036, 0.035), new THREE.Vector2(0, -0.04)]))),
      collar: geo('p-collar', () => new THREE.BoxGeometry(0.075, 0.04, 0.012)),
      pocket: geo('p-pocket', () => new THREE.BoxGeometry(0.07, 0.078, 0.006)),
      sealOuter: geo('p-seal-o', () => new THREE.CircleGeometry(0.021, 16)),
      sealInner: geo('p-seal-i', () => new THREE.CircleGeometry(0.015, 16)),
      button: geo('p-button', () => new THREE.SphereGeometry(0.0065, 6, 5)),
      placket: geo('p-placket', () => new THREE.BoxGeometry(0.024, 0.36, 0.004)),
      cape: geo('p-cape', () => new THREE.CylinderGeometry(0.13, 0.205, 0.07, 20, 1, true)),
      tie: geo('p-tie', () => new THREE.BoxGeometry(0.034, 0.17, 0.008)),
      knot: geo('p-knot', () => new THREE.BoxGeometry(0.032, 0.028, 0.014)),
      skirt: geo('p-skirt', () => new THREE.CylinderGeometry(0.175, 0.25, 0.42, 20, 1, true)),
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

function HeldBrochure({ cover }: { cover: THREE.Texture }) {
  const g = useBodyGeometry()
  return (
    <group position={[0.03, -0.33, 0.06]} rotation={[-1.05, 0, 0.25]}>
      <mesh geometry={g.brochure} material={mat('#FFF6EC', { roughness: 0.8 })} castShadow />
      <mesh geometry={g.brochureFace} position={[0, 0, 0.0025]}>
        <meshStandardMaterial map={cover} roughness={0.6} />
      </mesh>
    </group>
  )
}

function HeldClipboard() {
  const g = useBodyGeometry()
  return (
    <group position={[-0.02, -0.33, 0.08]} rotation={[-1.1, 0, -0.35]}>
      <mesh geometry={g.clipboard} material={mat('#8A5A34', { roughness: 0.7 })} castShadow />
      <mesh geometry={g.paper} position={[0, -0.01, 0.0045]} material={mat('#FBFBF8', { roughness: 0.9 })} />
    </group>
  )
}

interface Joints {
  rx: number
  rz: number
  re: number
  lx: number
  lz: number
  le: number
  wave: number
  lean: number
  yaw: number
  pitch: number
  walk: number
  stride: number
}

const jointsFor = (pose: Pose, yaw: number, pitch: number): Joints => {
  const P = POSES[pose]
  return { rx: P.r[0], rz: P.r[1], re: P.r[2], lx: P.l[0], lz: P.l[1], le: P.l[2], wave: 0, lean: P.lean ?? 0, yaw, pitch: pitch + (P.pitch ?? 0), walk: 0, stride: 0 }
}

export function Person(p: PersonProps) {
  const g = useBodyGeometry()
  const poseId = p.pose ?? 'stand'
  const body = useRef<THREE.Group>(null)
  const upperBody = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const rArm = useRef<THREE.Group>(null)
  const lArm = useRef<THREE.Group>(null)
  const rFore = useRef<THREE.Group>(null)
  const lFore = useRef<THREE.Group>(null)
  const rLeg = useRef<THREE.Group>(null)
  const lLeg = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const hidden = useRef(false)
  const hideTick = useRef(0)
  const nearHide = p.nearHide ?? 1
  const screen = useImageTexture('assets/screens/home.webp')
  const cover = useImageTexture('assets/textures/brochure-cover.webp')
  const shadow = p.castShadow ?? true
  const phase = p.phase ?? 0

  // When animated, joints are driven every frame and blend smoothly between poses, so the JSX only
  // carries the first pose (props that never change are never re-applied by react-three-fiber).
  const first = useRef<Joints | null>(null)
  first.current ??= jointsFor(poseId, p.headYaw ?? 0, p.headPitch ?? 0)
  const joints = useRef<Joints>({ ...first.current })
  const shown = p.animate ? first.current : jointsFor(poseId, p.headYaw ?? 0, p.headPitch ?? 0)

  // close to the camera: hide (and stop catching clicks) until it moves away again
  useFrame(({ camera }) => {
    const g = root.current
    if (!g || nearHide <= 0) return
    g.getWorldPosition(_pos)
    const top = 1.75 * (p.scale ?? 1)
    const cy = camera.position.y
    const dy = cy > top ? cy - top : cy < 0 ? -cy : 0
    const d = Math.hypot(camera.position.x - _pos.x, dy, camera.position.z - _pos.z)
    const near = d < (hidden.current ? nearHide + 0.2 : nearHide)
    // re-apply now and then while hidden, in case a highlight outline was added meanwhile
    if (near === hidden.current && !(near && ++hideTick.current % 30 === 0)) return
    hidden.current = near
    g.visible = !near
    g.traverse((o) => o.layers.set(near ? HIDDEN_LAYER : 0))
  })

  useFrame(({ clock }, delta) => {
    if (!p.animate) return
    const dt = Math.min(delta, 0.1)
    const t = clock.elapsedTime + phase
    const c = joints.current
    const P = POSES[poseId]
    const k = 1 - Math.exp(-dt * 7)

    // walk cycle
    const speed = p.gait?.current.speed ?? 0
    c.walk += (Math.min(1, speed / 0.8) - c.walk) * (1 - Math.exp(-dt * 6))
    c.stride += dt * speed * 5.8
    const sw = Math.sin(c.stride) * c.walk
    const idle = 1 - c.walk

    // arm targets: the pose, plus a swing when walking, plus small idle gestures
    let rx = P.r[0]
    let rz = P.r[1]
    let re = P.r[2]
    let lx = P.l[0]
    let lz = P.l[1]
    let le = P.l[2]
    if (SWING.has(poseId) && poseId !== 'wave') {
      rx -= sw * 0.42
      lx += sw * 0.42
      re -= 0.25 * c.walk
      le -= 0.25 * c.walk
    } else if (poseId === 'wave') {
      lx += sw * 0.42
    }
    if (poseId === 'talk') {
      re += Math.sin(t * 2.1) * 0.22 * idle
      le += Math.sin(t * 1.6 + 1) * 0.15 * idle
    } else if (poseId === 'present') {
      rx += Math.sin(t * 1.1) * 0.1
      re += Math.sin(t * 1.1 + 0.6) * 0.12
    } else if (poseId === 'clipboard') {
      re += Math.sin(t * 7) * 0.05 * idle
    } else if (poseId === 'point') {
      rx += Math.sin(t * 1.4) * 0.06
    } else if (poseId === 'reach') {
      rx += Math.sin(t * 2.2) * 0.08
    }
    c.rx += (rx - c.rx) * k
    c.rz += (rz - c.rz) * k
    c.re += (re - c.re) * k
    c.lx += (lx - c.lx) * k
    c.lz += (lz - c.lz) * k
    c.le += (le - c.le) * k
    c.wave += ((poseId === 'wave' ? 1 : 0) - c.wave) * k
    c.lean += ((P.lean ?? 0) + 0.05 * c.walk - c.lean) * k
    const look = poseId === 'phone' || poseId === 'read' ? 0.05 : 0.16
    c.yaw += ((p.headYaw ?? 0) + Math.sin(t * 0.45) * look * idle - c.yaw) * (1 - Math.exp(-dt * 4))
    c.pitch += ((p.headPitch ?? 0) + (P.pitch ?? 0) + Math.sin(t * 0.7) * 0.025 - c.pitch) * k

    if (rArm.current) rArm.current.rotation.set(c.rx, 0, c.rz)
    if (lArm.current) lArm.current.rotation.set(c.lx, 0, c.lz)
    if (rFore.current) rFore.current.rotation.set(c.re, 0, Math.sin(t * 5) * 0.35 * c.wave)
    if (lFore.current) lFore.current.rotation.x = c.le
    if (rLeg.current) rLeg.current.rotation.x = sw * 0.46
    if (lLeg.current) lLeg.current.rotation.x = -sw * 0.46
    if (body.current) body.current.position.y = Math.abs(Math.sin(c.stride)) * 0.028 * c.walk
    if (upperBody.current) {
      upperBody.current.rotation.x = c.lean + Math.sin(t * 1.3) * 0.012 * idle
      upperBody.current.rotation.y = sw * 0.07
      upperBody.current.rotation.z = Math.sin(t * 0.6) * 0.012 * idle
    }
    if (head.current) head.current.rotation.set(c.pitch, c.yaw, 0)
  })

  const outfit = p.outfit ?? 'casual'
  const isM = outfit === 'smcbi-m'
  const isF = outfit === 'smcbi-f'
  const topColor = isM ? UNIFORM.shirt : isF ? UNIFORM.blouse : (p.top ?? '#F7F9FC')
  const skin = mat(p.skin, { roughness: 0.65 })
  const hair = mat(p.hair, { roughness: 0.85 })
  const top = mat(topColor, { roughness: 0.8 })
  // skirt uniform: bare legs below the skirt
  const bottom = mat(isM ? UNIFORM.slacks : isF ? p.skin : (p.bottom ?? '#22262E'), { roughness: isF ? 0.65 : 0.85 })
  const shoes = mat(isM || isF ? UNIFORM.shoes : (p.shoes ?? '#2A2D35'), { roughness: 0.5 })
  const longSleeves = !!p.longSleeves && !isM && !isF
  const sleeve = longSleeves ? top : skin
  const holdsPhone = poseId === 'phone' || poseId === 'scan'
  const holdsBrochure = poseId === 'read'
  const holdsClipboard = poseId === 'clipboard'

  const arm = (side: 1 | -1) => {
    const right = side === -1
    return (
      <group ref={right ? rArm : lArm} position={[side * 0.205, 1.43 - 0.88, 0]} rotation={[right ? shown.rx : shown.lx, 0, right ? shown.rz : shown.lz]}>
        <mesh geometry={g.upper} material={sleeve} position={[0, -0.15, 0]} castShadow={shadow} />
        {/* short sleeve opening, so uniforms and tees read as short-sleeved */}
        {!longSleeves && (
          <>
            <mesh geometry={g.shoulder} material={top} position={[0, -0.012, 0]} scale={[1, 0.9, 1]} castShadow={shadow} />
            <mesh geometry={g.sleeve} material={top} position={[0, -0.09, 0]} castShadow={shadow} />
          </>
        )}
        <group ref={right ? rFore : lFore} position={[0, -0.3, 0]} rotation={[right ? shown.re : shown.le, 0, 0]}>
          <mesh geometry={g.fore} material={sleeve} position={[0, -0.13, 0]} castShadow={shadow} />
          <mesh geometry={g.hand} material={skin} position={[0, -0.28, 0]} />
          {right && holdsPhone && <HeldPhone screen={screen} />}
          {right && holdsBrochure && <HeldBrochure cover={cover} />}
          {!right && holdsClipboard && <HeldClipboard />}
        </group>
      </group>
    )
  }

  const hs = p.hairStyle ?? 'short'
  return (
    <group ref={root} position={p.position} rotation={[0, p.rotation ?? 0, 0]} scale={p.scale ?? 1}>
      <group ref={body}>
        {/* legs pivot at the hips so they can swing */}
        {([1, -1] as const).map((s) => (
          <group key={s} ref={s === -1 ? rLeg : lLeg} position={[s * 0.092, 0.88, 0]}>
            <mesh geometry={g.leg} material={bottom} position={[0, -0.41, 0]} castShadow={shadow}>
              <Hl />
            </mesh>
            <mesh geometry={g.shoe} material={shoes} position={[0, -0.845, 0.04]} castShadow={shadow} />
          </group>
        ))}
        {isF && <mesh geometry={g.skirt} material={mat(UNIFORM.skirt, { roughness: 0.85, side: THREE.DoubleSide })} position={[0, 0.66, 0]} castShadow={shadow} />}

        {/* upper body pivots at the hips */}
        <group ref={upperBody} position={[0, 0.88, 0]} rotation={[shown.lean, 0, 0]}>
          <mesh geometry={g.torso} material={top} position={[0, 0.3, 0]} scale={[1.18, 1, 0.74]} castShadow={shadow}>
            <Hl />
          </mesh>
          <mesh geometry={g.neck} material={skin} position={[0, 0.66, 0]} />

          {isM && (
            <group>
              {/* white undershirt at the open collar, collar points, button placket, chest pocket with the school seal */}
              <mesh geometry={g.vee} material={basic('#F4F5F7')} position={[0, 0.565, 0.1]} rotation={[-0.42, 0, 0]} />
              <mesh geometry={g.collar} material={mat(UNIFORM.collar, { roughness: 0.8 })} position={[-0.044, 0.585, 0.092]} rotation={[-0.45, 0.25, -0.62]} />
              <mesh geometry={g.collar} material={mat(UNIFORM.collar, { roughness: 0.8 })} position={[0.044, 0.585, 0.092]} rotation={[-0.45, -0.25, 0.62]} />
              <mesh geometry={g.placket} material={mat(UNIFORM.shirtShade, { roughness: 0.8 })} position={[0, 0.33, 0.117]} />
              {[0.47, 0.37, 0.27, 0.17].map((y) => (
                <mesh key={y} geometry={g.button} material={basic('#F4F5F7')} position={[0, y, 0.121]} />
              ))}
              <group position={[0.088, 0.42, 0.104]} rotation={[0, 0.42, 0]}>
                <mesh geometry={g.pocket} material={mat(UNIFORM.shirtShade, { roughness: 0.8 })} />
                <mesh geometry={g.sealOuter} material={basic(UNIFORM.seal)} position={[0, 0.006, 0.0035]} />
                <mesh geometry={g.sealInner} material={basic('#F1F3F7')} position={[0, 0.006, 0.0042]} />
              </group>
            </group>
          )}
          {isF && (
            <group>
              {/* wide white collar and navy necktie */}
              <mesh geometry={g.cape} material={mat('#FFFFFF', { roughness: 0.8, side: THREE.DoubleSide })} position={[0, 0.575, 0]} scale={[1.05, 1, 0.8]} />
              <mesh geometry={g.knot} material={mat(UNIFORM.tie, { roughness: 0.6 })} position={[0, 0.555, 0.1]} rotation={[-0.35, 0, 0]} />
              <mesh geometry={g.tie} material={mat(UNIFORM.tie, { roughness: 0.6 })} position={[0, 0.45, 0.121]} rotation={[-0.08, 0, 0]} />
            </group>
          )}

          <group ref={head} position={[0, 0.78, 0]} rotation={[shown.pitch, shown.yaw, 0]}>
            <mesh geometry={g.head} material={skin} scale={[1, 1.08, 1]} castShadow={shadow}>
              <Hl />
            </mesh>
            {hs !== 'buzz' && <mesh geometry={g.hairCap} material={hair} position={[0, 0.012, -0.012]} rotation={[-0.25, 0, 0]} />}
            {hs === 'buzz' && <mesh geometry={g.hairCap} material={hair} position={[0, 0.006, -0.004]} scale={[0.985, 1, 0.985]} rotation={[-0.15, 0, 0]} />}
            {hs === 'long' && <mesh geometry={g.hairLong} material={hair} position={[0, -0.1, -0.06]} scale={[1.15, 1, 0.55]} />}
            {hs === 'ponytail' && <mesh geometry={g.hairLong} material={hair} position={[0, -0.06, -0.12]} scale={[0.45, 0.8, 0.45]} rotation={[0.35, 0, 0]} />}
            {hs === 'bun' && <mesh geometry={g.bun} material={hair} position={[0, 0.1, -0.08]} />}
            {hs === 'curly' &&
              (
                [
                  [0, 0.112, 0.02],
                  [0.055, 0.1, 0.045],
                  [-0.055, 0.1, 0.045],
                  [0.03, 0.085, 0.085],
                  [-0.03, 0.088, 0.083],
                  [0.085, 0.07, -0.01],
                  [-0.085, 0.07, -0.01],
                  [0.04, 0.11, -0.05],
                  [-0.04, 0.11, -0.05],
                ] as [number, number, number][]
              ).map((q, i) => <mesh key={i} geometry={g.curl} material={hair} position={q} scale={i < 5 ? 1 : 0.9} />)}
            {hs === 'side' && <mesh geometry={g.curl} material={hair} position={[0.04, 0.095, 0.075]} scale={[1.7, 0.7, 0.9]} rotation={[0.3, 0, -0.3]} />}
            {hs === 'cap' && (
              <>
                <mesh geometry={g.hairCap} material={mat(topColor === '#1F4BD8' ? '#0B1B4D' : '#1F4BD8', { roughness: 0.7 })} position={[0, 0.02, -0.006]} scale={1.03} rotation={[-0.15, 0, 0]} />
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
              <mesh geometry={g.strap} material={basic(p.lanyardColor ?? '#3FD0F0')} position={[-0.045, 0.12, 0]} rotation={[0, 0, -0.35]} />
              <mesh geometry={g.strap} material={basic(p.lanyardColor ?? '#3FD0F0')} position={[0.045, 0.12, 0]} rotation={[0, 0, 0.35]} />
              <mesh geometry={g.card} material={basic('#F7F9FC')} position={[0, -0.02, 0.004]} />
            </group>
          )}
        </group>
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
    // mostly SMCBI uniforms (light blue polos, white blouses), with some casual and org shirts
    const shirts = [UNIFORM.shirt, UNIFORM.shirt, UNIFORM.blouse, UNIFORM.shirt, UNIFORM.blouse, '#2E3440', '#E9935B', '#5BA79A', '#8E7DC9', '#D9534A', '#F1C453']
    const pants = ['#22262E', '#1C2130', '#2F3A55', '#24304F', '#1E2230']
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
