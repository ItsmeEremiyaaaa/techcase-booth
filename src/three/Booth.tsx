import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Quality } from '../lib/store'
import { Hl, Interactive } from './Interactive'
import { Person } from './People'
import { C, basic, geo, mat } from './shared'
import { useImageTexture, usePanelTexture, useQrSignTexture } from './textures'

/** Booth origin on the court (centre of the floor mat). The booth faces +Z. */
export const BOOTH: [number, number, number] = [0, 0, -3.4]
const TABLE = { w: 1.83, h: 0.74, d: 0.76, z: 0.15 }
const TOP = TABLE.h

/* ---------------- Devices ---------------- */
function DeviceOnStand({ size, screen, position, rotation = 0, tilt = 0.32 }: { size: [number, number]; screen: THREE.Texture; position: [number, number, number]; rotation?: number; tilt?: number }) {
  const [w, h] = size
  const body = useMemo(() => geo(`dev-${w}x${h}`, () => new RoundedBoxGeometry(w, h, 0.009, 2, Math.min(w, h) * 0.08)), [w, h])
  const glass = useMemo(() => geo(`dev-screen-${w}x${h}`, () => new THREE.PlaneGeometry(w * 0.9, h * 0.93)), [w, h])
  const stand = mat('#D8DEE8', { roughness: 0.25, metalness: 0.2, transparent: true, opacity: 0.85 })
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* acrylic stand */}
      <mesh position={[0, 0.006, -0.02]} material={stand} castShadow>
        <boxGeometry args={[w * 0.9, 0.012, 0.11]} />
      </mesh>
      <mesh position={[0, h * 0.25, -0.05 - Math.sin(tilt) * h * 0.2]} rotation={[-tilt, 0, 0]} material={stand}>
        <boxGeometry args={[w * 0.55, h * 0.6, 0.008]} />
      </mesh>
      <group position={[0, h / 2 * Math.cos(tilt) + 0.012, -Math.sin(tilt) * h * 0.5 + 0.01]} rotation={[-tilt, 0, 0]}>
        <mesh geometry={body} material={mat('#11141B', { roughness: 0.3, metalness: 0.5 })} castShadow>
          <Hl />
        </mesh>
        <mesh geometry={glass} position={[0, 0, 0.0052]}>
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function Devices() {
  const home = useImageTexture('assets/screens/home.webp')
  const quiz = useImageTexture('assets/screens/quiz.webp')
  const tablet = useImageTexture('assets/screens/tablet-home.webp')
  return (
    <Interactive id="devices" marker={[1.5, 0.5]} markerAt={[0, TOP + 0.002, TABLE.z - 0.05]}>
      <DeviceOnStand size={[0.19, 0.255]} screen={tablet} position={[0, TOP, TABLE.z - 0.05]} tilt={0.3} />
      <DeviceOnStand size={[0.075, 0.158]} screen={home} position={[-0.42, TOP, TABLE.z + 0.02]} rotation={0.18} />
      <DeviceOnStand size={[0.075, 0.158]} screen={quiz} position={[0.42, TOP, TABLE.z + 0.02]} rotation={-0.18} />
    </Interactive>
  )
}

/* ---------------- QR stands ---------------- */
function TableQr({ position, rotation, tex }: { position: [number, number, number]; rotation: number; tex: THREE.Texture }) {
  const acrylic = mat('#EAF2FF', { roughness: 0.08, transparent: true, opacity: 0.45 })
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.004, 0.02]} material={acrylic}>
        <boxGeometry args={[0.16, 0.008, 0.09]} />
      </mesh>
      <group position={[0, 0.112, 0]} rotation={[-0.22, 0, 0]}>
        <mesh material={acrylic} castShadow>
          <boxGeometry args={[0.158, 0.222, 0.006]} />
          <Hl />
        </mesh>
        <mesh position={[0, 0, 0.0035]}>
          <planeGeometry args={[0.148, 0.21]} />
          <meshStandardMaterial map={tex} roughness={0.35} />
        </mesh>
      </group>
    </group>
  )
}

function FloorQr({ tex }: { tex: THREE.Texture }) {
  const metal = mat('#2C313B', { roughness: 0.35, metalness: 0.6 })
  return (
    <group position={[2.0, 0, 0.55]} rotation={[0, -0.4, 0]}>
      <mesh position={[0, 0.012, 0]} material={metal} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.024, 24]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={metal} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 1.1, 8]} />
      </mesh>
      <group position={[0, 1.2, 0.02]} rotation={[-0.26, 0, 0]}>
        <mesh material={metal} castShadow>
          <boxGeometry args={[0.32, 0.44, 0.012]} />
          <Hl />
        </mesh>
        <mesh position={[0, 0, 0.0065]}>
          <planeGeometry args={[0.297, 0.42]} />
          <meshStandardMaterial map={tex} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

/* ---------------- Balloon columns (instanced) ---------------- */
function Balloons() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const g = useMemo(() => geo('balloon', () => new THREE.SphereGeometry(0.11, 14, 12).scale(1, 1.15, 1)), [])
  const m = useMemo(() => mat('#ffffff', { roughness: 0.25, metalness: 0.05 }), [])
  const spots: [number, number][] = [[-2.15, 1.6], [2.15, 1.6]]
  const layers = 8
  const count = spots.length * (layers * 4 + 1)
  useLayoutEffect(() => {
    if (!ref.current) return
    const cols = [C.royal, '#FFFFFF', C.cyan, C.royal]
    const mtx = new THREE.Matrix4()
    const col = new THREE.Color()
    let i = 0
    for (const [x, z] of spots) {
      for (let l = 0; l < layers; l++) {
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2 + l * 0.78
          mtx.makeTranslation(x + Math.cos(a) * 0.1, 0.25 + l * 0.2, z + Math.sin(a) * 0.1)
          ref.current.setMatrixAt(i, mtx)
          ref.current.setColorAt(i++, col.set(cols[(l + k) % 4]))
        }
      }
      mtx.compose(new THREE.Vector3(x, 0.25 + layers * 0.2 + 0.06, z), new THREE.Quaternion(), new THREE.Vector3(1.5, 1.5, 1.5))
      ref.current.setMatrixAt(i, mtx)
      ref.current.setColorAt(i++, col.set(C.cyan))
    }
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
    ref.current.computeBoundingSphere()
  })
  return (
    <group>
      <instancedMesh ref={ref} args={[g, m, count]} castShadow />
      {spots.map(([x, z]) => (
        <mesh key={x} position={[x, 0.11, z]} material={mat('#E3E8F0', { roughness: 0.6 })} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.22, 16]} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Booth ---------------- */
export function Booth({ quality, animate }: { quality: Quality; animate: boolean }) {
  const backdropTex = useImageTexture('assets/textures/backdrop.webp')
  const rollupTex = useImageTexture('assets/textures/rollup.webp')
  const frontTex = useImageTexture('assets/textures/tablefront.webp')
  const qrTex = useQrSignTexture()
  const alu = mat(C.aluminium, { roughness: 0.3, metalness: 0.8 })
  const fabric = mat(C.royal, { roughness: 0.95 })
  const fabricTop = mat('#2756E0', { roughness: 0.9 })
  const tableFrontZ = TABLE.z + TABLE.d / 2

  return (
    <group position={BOOTH}>
      {/* floor mat */}
      <RoundedBox args={[4.4, 0.02, 3.4]} radius={0.008} position={[0, 0.01, 0]} receiveShadow material={mat('#1A3AA0', { roughness: 1 })} />
      <mesh position={[0, 0.021, 1.69]} material={basic(C.cyan)}>
        <boxGeometry args={[4.4, 0.002, 0.03]} />
      </mesh>

      {/* -------- backdrop -------- */}
      <Interactive id="backdrop" marker={[3.3, 0.5]} markerAt={[0, 0.02, -1.45]}>
        <group position={[0, 0, -1.45]}>
          <mesh position={[0, 1.27, -0.02]} material={mat('#F0F3F8', { roughness: 0.9 })} castShadow receiveShadow>
            <boxGeometry args={[3.04, 2.44, 0.03]} />
            <Hl />
          </mesh>
          <mesh position={[0, 1.27, -0.0045]}>
            <planeGeometry args={[3.0, 2.4]} />
            <meshStandardMaterial map={backdropTex} roughness={0.85} />
          </mesh>
          {[-1.54, 1.54].map((x) => (
            <group key={x}>
              <mesh position={[x, 1.28, -0.02]} material={alu} castShadow>
                <boxGeometry args={[0.04, 2.56, 0.04]} />
              </mesh>
              <mesh position={[x, 0.012, -0.02]} material={alu} castShadow>
                <boxGeometry args={[0.06, 0.024, 0.6]} />
              </mesh>
              {/* LED arm light */}
              <group position={[x * 0.62, 2.5, -0.02]}>
                <mesh position={[0, 0.05, 0.16]} rotation={[0.6, 0, 0]} material={mat('#2B2F38', { roughness: 0.4, metalness: 0.6 })}>
                  <cylinderGeometry args={[0.008, 0.008, 0.34, 6]} />
                </mesh>
                <mesh position={[0, 0.13, 0.3]} rotation={[-0.9, 0, 0]} material={mat('#2B2F38', { roughness: 0.4, metalness: 0.6 })}>
                  <cylinderGeometry args={[0.035, 0.05, 0.1, 12]} />
                </mesh>
                <mesh position={[0, 0.095, 0.33]} rotation={[-0.9 + Math.PI, 0, 0]} material={basic('#FFF6DD', { toneMapped: false })}>
                  <circleGeometry args={[0.045, 12]} />
                </mesh>
              </group>
            </group>
          ))}
          <mesh position={[0, 2.54, -0.02]} material={alu}>
            <boxGeometry args={[3.12, 0.04, 0.04]} />
          </mesh>
        </group>
      </Interactive>

      {/* -------- table -------- */}
      <Interactive id="table" marker={[2.2, 1.1]} markerAt={[0, 0.022, TABLE.z]}>
        <RoundedBox args={[TABLE.w, TABLE.h, TABLE.d]} radius={0.025} smoothness={3} position={[0, TABLE.h / 2, TABLE.z]} material={fabric} castShadow receiveShadow>
          <Hl />
        </RoundedBox>
        <mesh position={[0, TABLE.h + 0.001, TABLE.z]} rotation={[-Math.PI / 2, 0, 0]} material={fabricTop} receiveShadow>
          <planeGeometry args={[TABLE.w - 0.04, TABLE.d - 0.04]} />
        </mesh>
        <mesh position={[0, TABLE.h / 2, tableFrontZ + 0.0015]}>
          <planeGeometry args={[TABLE.w - 0.03, TABLE.h - 0.02]} />
          <meshStandardMaterial map={frontTex} roughness={0.95} />
        </mesh>
        {/* brochure stack (the StudyQuest tri-fold) */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.68 + i * 0.012, TOP + 0.006 + i * 0.008, TABLE.z + 0.2]} rotation={[0, 0.1 + i * 0.12, 0]} material={mat(i % 2 ? C.cream : C.orange, { roughness: 0.8 })} castShadow>
            <boxGeometry args={[0.1, 0.008, 0.215]} />
          </mesh>
        ))}
        {/* water bottle */}
        <mesh position={[0.78, TOP + 0.1, TABLE.z - 0.22]} material={mat('#9FD6F2', { roughness: 0.1, transparent: true, opacity: 0.7 })} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.2, 14]} />
        </mesh>
      </Interactive>

      <Devices />

      <Interactive id="qr" marker={[0.7, 0.7]} markerAt={[2.0, 0.022, 0.55]}>
        <TableQr position={[-0.78, TOP, TABLE.z + 0.16]} rotation={0.25} tex={qrTex} />
        <TableQr position={[0.75, TOP, TABLE.z + 0.16]} rotation={-0.25} tex={qrTex} />
        <FloorQr tex={qrTex} />
      </Interactive>

      {/* -------- roll-up banner -------- */}
      <Interactive id="banner" marker={[1.1, 0.6]} markerAt={[-2.0, 0.022, -0.7]}>
        <group position={[-2.0, 0, -0.7]} rotation={[0, 0.3, 0]}>
          <RoundedBox args={[0.9, 0.09, 0.22]} radius={0.03} position={[0, 0.045, 0]} material={alu} castShadow />
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.3, 0.012, 0.12]} rotation={[0, s * 0.5, 0]} material={alu}>
              <boxGeometry args={[0.04, 0.02, 0.3]} />
            </mesh>
          ))}
          <mesh position={[0, 1.07, -0.035]} material={alu}>
            <cylinderGeometry args={[0.009, 0.009, 2.0, 6]} />
          </mesh>
          <mesh position={[0, 1.09, 0]} castShadow>
            <boxGeometry args={[0.85, 2.0, 0.004]} />
            <meshStandardMaterial color="#F4F6FA" roughness={0.8} />
            <Hl />
          </mesh>
          <mesh position={[0, 1.09, 0.0025]}>
            <planeGeometry args={[0.85, 2.0]} />
            <meshStandardMaterial map={rollupTex} roughness={0.6} />
          </mesh>
          <mesh position={[0, 2.095, 0]} material={alu}>
            <boxGeometry args={[0.87, 0.018, 0.02]} />
          </mesh>
        </group>
      </Interactive>

      {quality !== 'low' && <Balloons />}

      {/* -------- booth representatives (behind the table) -------- */}
      <Person position={[-0.45, 0.02, -0.55]} rotation={0.15} skin="#C68A62" hair="#1B1410" hairStyle="short" top={C.royal} bottom="#1E2230" pose="present" headYaw={-0.25} headPitch={0.18} lanyard rep animate={animate} phase={0.4} />
      <Person position={[0.62, 0.02, -0.6]} rotation={-0.2} scale={0.96} skin="#E0B08A" hair="#2B1B12" hairStyle="ponytail" top={C.royal} bottom="#1E2230" pose="talk" headYaw={0.2} lanyard rep animate={animate} phase={1.7} />
    </group>
  )
}

/* ---------------- Students in front of the booth ---------------- */
export function Students({ quality, animate }: { quality: Quality; animate: boolean }) {
  const shadow = quality !== 'low'
  return (
    <Interactive id="students" marker={[4.0, 2.2]} markerAt={[0.2, 0.02, -1.55]}>
      {/* trying the phone demo */}
      <Person position={[-0.6, 0, -2.25]} rotation={Math.PI - 0.12} skin="#8D5A3B" hair="#120D0A" hairStyle="buzz" top="#F7F9FC" bottom="#3B4A6B" pose="lean" headPitch={0.35} backpack="#2E3440" animate={animate} phase={0.2} castShadow={shadow} />
      {/* scanning the table QR */}
      <Person position={[0.85, 0, -2.2]} rotation={Math.PI + 0.3} scale={0.95} skin="#F0C9A6" hair="#3A2414" hairStyle="long" top="#E9935B" bottom="#2F3A55" pose="scan" headPitch={0.2} animate={animate} phase={2.3} castShadow={shadow} />
      {/* friends chatting while waiting */}
      <Person position={[1.35, 0, -1.25]} rotation={Math.PI + 0.9} skin="#A86F4C" hair="#1B1410" hairStyle="cap" top="#5BA79A" bottom="#22262E" pose="talk" headYaw={0.3} animate={animate} phase={3.1} castShadow={shadow} />
      <Person position={[0.75, 0, -0.75]} rotation={Math.PI - 2.2} scale={0.94} skin="#E0B08A" hair="#2B1B12" hairStyle="bun" top="#F1C453" bottom="#3B4A6B" pose="phone" animate={animate} phase={4.2} castShadow={shadow} backpack="#1F4BD8" />
      {/* watching the demo */}
      <Person position={[1.95, 0, -1.95]} rotation={Math.PI + 0.75} skin="#C68A62" hair="#120D0A" hairStyle="short" top="#2E3440" bottom="#5C6678" pose="crossed" headYaw={-0.35} animate={animate} phase={5.5} castShadow={shadow} />
      {quality !== 'low' && (
        <Person position={[2.65, 0, -0.9]} rotation={Math.PI + 0.7} scale={0.97} skin="#6E432B" hair="#120D0A" hairStyle="short" top="#8E7DC9" bottom="#22262E" pose="pockets" headYaw={0.4} animate={animate} phase={6.1} castShadow={shadow} backpack="#E9935B" />
      )}
    </Interactive>
  )
}

/* ---------------- Neighbouring booths & general event dressing ---------------- */
function OtherBooth({ x, cloth, a, b, rotation = 0 }: { x: number; cloth: string; a: string; b: string; rotation?: number }) {
  const panel = usePanelTexture(a, b)
  const alu = mat(C.aluminium, { roughness: 0.3, metalness: 0.8 })
  return (
    <group position={[x, 0, -3.6]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.1, -1.1]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.0, 0.03]} />
        <meshStandardMaterial map={panel} roughness={0.85} />
      </mesh>
      {[-1.27, 1.27].map((px) => (
        <mesh key={px} position={[px, 1.1, -1.1]} material={alu}>
          <boxGeometry args={[0.04, 2.2, 0.04]} />
        </mesh>
      ))}
      <RoundedBox args={[1.83, 0.74, 0.76]} radius={0.025} position={[0, 0.37, 0]} material={mat(cloth, { roughness: 0.95 })} castShadow receiveShadow />
      <mesh position={[0.2, 0.74 + 0.1, -0.05]} rotation={[-0.3, 0, 0]} material={mat('#1A1D24', { roughness: 0.3, metalness: 0.5 })} castShadow>
        <boxGeometry args={[0.34, 0.22, 0.012]} />
      </mesh>
    </group>
  )
}

function buildChair() {
  const parts = [
    new THREE.BoxGeometry(0.44, 0.04, 0.42).translate(0, 0.45, 0),
    new THREE.BoxGeometry(0.44, 0.34, 0.03).translate(0, 0.72, -0.2),
  ]
  for (const [x, z] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) {
    parts.push(new THREE.BoxGeometry(0.025, z < 0 ? 0.9 : 0.45, 0.025).translate(x, z < 0 ? 0.45 : 0.225, z))
  }
  const g = mergeGeometries(parts)!
  parts.forEach((p) => p.dispose())
  return g
}

function Chairs({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const chairGeo = useMemo(() => geo('chair', buildChair), [])
  useLayoutEffect(() => {
    if (!ref.current) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2)
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 6)
      const col = i % 6
      m.compose(new THREE.Vector3(10.4 + row * 0.8, 0, -1.6 + col * 0.55), q, new THREE.Vector3(1, 1, 1))
      ref.current.setMatrixAt(i, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [count])
  return <instancedMesh ref={ref} args={[chairGeo, mat('#2A3F7A', { roughness: 0.6 }), count]} castShadow receiveShadow />
}

export function EventDressing({ quality, animate }: { quality: Quality; animate: boolean }) {
  const shadow = quality === 'high'
  return (
    <group>
      <OtherBooth x={-7.2} cloth="#2F8F6B" a="#2F8F6B" b="#3FA57E" rotation={0.08} />
      <OtherBooth x={7.2} cloth="#8A2B3A" a="#8A2B3A" b="#A63B4C" rotation={-0.08} />
      <Person position={[-7.1, 0, -4.3]} skin="#C68A62" hair="#1B1410" top="#2F8F6B" bottom="#22262E" pose="talk" animate={animate} phase={7.3} castShadow={shadow} />
      <Person position={[7.4, 0, -4.3]} skin="#F0C9A6" hair="#3A2414" hairStyle="long" top="#8A2B3A" bottom="#22262E" pose="stand" animate={animate} phase={8.1} castShadow={shadow} />
      {quality !== 'low' && (
        <>
          <Person position={[-6.6, 0, -2.4]} rotation={Math.PI + 0.3} skin="#8D5A3B" hair="#120D0A" hairStyle="buzz" top="#F7F9FC" bottom="#3B4A6B" pose="pockets" backpack="#8A2B3A" animate={animate} phase={9.2} castShadow={shadow} />
          <Person position={[6.9, 0, -2.5]} rotation={Math.PI - 0.4} skin="#E0B08A" hair="#2B1B12" hairStyle="bun" top="#B7C4DE" bottom="#2F3A55" pose="phone" animate={animate} phase={10.4} castShadow={shadow} />
          {/* students crossing the court */}
          <Person position={[4.3, 0, 1.6]} rotation={-1.9} skin="#A86F4C" hair="#1B1410" hairStyle="short" top="#F1C453" bottom="#22262E" pose="wave" backpack="#2E3440" animate={animate} phase={11.1} castShadow={shadow} />
          <Person position={[-3.8, 0, 2.3]} rotation={2.4} scale={0.95} skin="#F0C9A6" hair="#120D0A" hairStyle="long" top="#5BA79A" bottom="#3B4A6B" pose="phone" animate={animate} phase={12.6} castShadow={shadow} />
          <Person position={[-3.2, 0, 2.6]} rotation={-2.6} skin="#6E432B" hair="#120D0A" hairStyle="cap" top="#E9935B" bottom="#22262E" pose="talk" animate={animate} phase={13.4} castShadow={shadow} />
          <Chairs count={18} />
        </>
      )}
    </group>
  )
}
