import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import { selectObject, store, useStore } from '../lib/store'
import type { ObjectId } from '../content/booth'
import { geo } from './shared'

export type HlState = 'none' | 'hover' | 'selected'
const HlCtx = createContext<HlState>('none')

/** Lets any group (e.g. a team member) drive the <Hl /> outlines of the meshes inside it. */
export const HighlightProvider = HlCtx.Provider

interface Props {
  id: ObjectId
  children: ReactNode
  /** footprint of the floor marker [width, depth] in metres, centred on `markerAt` */
  marker?: [number, number]
  markerAt?: [number, number, number]
}

/** Wraps a group of meshes so they hover, highlight and open their info panel on click. */
export function Interactive({ id, children, marker, markerAt = [0, 0, 0] }: Props) {
  const selected = useStore((s) => s.selected === id)
  const hovered = useStore((s) => s.hovered === id)
  const state: HlState = selected ? 'selected' : hovered ? 'hover' : 'none'

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    store.set({ hovered: id })
    document.body.style.cursor = 'pointer'
  }
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (store.get().hovered === id) store.set({ hovered: null })
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    // ignore clicks that were really orbit drags
    if (e.delta > 6) return
    e.stopPropagation()
    selectObject(id)
  }

  return (
    <group onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      <HlCtx.Provider value={state}>{children}</HlCtx.Provider>
      {marker && state !== 'none' && <FloorMarker size={marker} position={markerAt} strong={state === 'selected'} />}
    </group>
  )
}

/** Drop inside a <mesh> to give it an outline while its Interactive parent is hovered/selected. */
export function Hl() {
  const s = useContext(HlCtx)
  if (s === 'none') return null
  // drei's non-screenspace mode offsets in clip space, i.e. thickness is in pixels
  return <Outlines thickness={s === 'selected' ? 3.5 : 2.5} color={s === 'selected' ? '#7B5CE0' : '#FFFFFF'} toneMapped={false} />
}

export function useHl() {
  return useContext(HlCtx)
}

function roundedRectOutline(w: number, d: number, r: number, t: number) {
  const shape = (W: number, D: number, R: number) => {
    const s = new THREE.Shape()
    const x = -W / 2
    const y = -D / 2
    s.moveTo(x + R, y)
    s.lineTo(x + W - R, y)
    s.quadraticCurveTo(x + W, y, x + W, y + R)
    s.lineTo(x + W, y + D - R)
    s.quadraticCurveTo(x + W, y + D, x + W - R, y + D)
    s.lineTo(x + R, y + D)
    s.quadraticCurveTo(x, y + D, x, y + D - R)
    s.lineTo(x, y + R)
    s.quadraticCurveTo(x, y, x + R, y)
    return s
  }
  const outer = shape(w, d, r)
  const inner = shape(w - t * 2, d - t * 2, Math.max(0.01, r - t))
  outer.holes.push(inner)
  const g = new THREE.ShapeGeometry(outer, 8)
  g.rotateX(-Math.PI / 2)
  return g
}

export function FloorMarker({ size, position, strong }: { size: [number, number]; position: [number, number, number]; strong: boolean }) {
  const g = useMemo(() => geo(`marker-${size.join('x')}`, () => roundedRectOutline(size[0], size[1], 0.18, 0.05)), [size])
  const fill = useMemo(() => geo(`marker-fill-${size.join('x')}`, () => new THREE.PlaneGeometry(size[0], size[1]).rotateX(-Math.PI / 2)), [size])
  const m = useRef<THREE.MeshBasicMaterial>(null)
  const f = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    const p = 0.65 + Math.sin(clock.elapsedTime * 3) * 0.25
    if (m.current) m.current.opacity = strong ? p : 0.55
    if (f.current) f.current.opacity = strong ? 0.1 + p * 0.06 : 0.06
  })
  return (
    <group position={[position[0], position[1] + 0.012, position[2]]} renderOrder={2}>
      <mesh geometry={g} raycast={() => null}>
        <meshBasicMaterial ref={m} color="#7B5CE0" transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={fill} raycast={() => null}>
        <meshBasicMaterial ref={f} color="#7B5CE0" transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
