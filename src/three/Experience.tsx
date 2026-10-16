import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, ContactShadows, Environment, Html, Lightformer, PerformanceMonitor, useProgress } from '@react-three/drei'
import { Flag, Megaphone, QrCode, Smartphone, Table2, Users } from 'lucide-react'
import { boothObjects, type ObjectId } from '../content/booth'
import { panelOpen, registerCamera, selectObject, store, useStore, type Quality, type ViewId } from '../lib/store'
import { Booth, EventDressing, Students } from './Booth'
import { Court } from './Court'
import { BleacherCrowd } from './People'
import { HOTSPOTS, VIEWS } from './views'
import { disposeShared } from './shared'
import { clearImageTextures } from './textures'

export interface ExperienceProps {
  quality: Quality
  reducedMotion: boolean
  visible: boolean
}

const SETTINGS: Record<Quality, { dpr: number; shadowMap: number; crowd: number; antialias: boolean }> = {
  high: { dpr: 1.75, shadowMap: 2048, crowd: 46, antialias: true },
  medium: { dpr: 1.5, shadowMap: 1024, crowd: 24, antialias: true },
  low: { dpr: 1, shadowMap: 0, crowd: 0, antialias: false },
}

const ICONS: Record<ObjectId, typeof Flag> = {
  table: Table2,
  backdrop: Flag,
  banner: Megaphone,
  devices: Smartphone,
  qr: QrCode,
  students: Users,
}

function Controls({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<CameraControls>(null)
  const gl = useThree((st) => st.gl)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-14, 0.1, -10), new THREE.Vector3(14, 4.5, 9)))
    c.boundaryFriction = 0.2
    c.dollyToCursor = true
    const animated = (instant?: boolean) => !(instant || reducedMotion)
    // keep the inspected object clear of the info panel (side panel on desktop, bottom sheet on phones)
    const applyOffset = (distance: number, instant?: boolean) => {
      const el = c.camera as THREE.PerspectiveCamera
      const k = Math.tan(THREE.MathUtils.degToRad(el.fov / 2)) * distance
      if (!panelOpen()) return void c.setFocalOffset(0, 0, 0, animated(instant))
      const dom = gl.domElement
      if (window.matchMedia('(max-width: 760px)').matches) void c.setFocalOffset(0, 0.5 * k, 0, animated(instant)) // camera-controls flips Y
      else void c.setFocalOffset(Math.min(0.36, 408 / Math.max(1, dom.clientHeight)) * k, 0, 0, animated(instant))
    }
    let wasOpen = panelOpen()
    const unsub = store.subscribe(() => {
      const open = panelOpen()
      if (open === wasOpen) return
      wasOpen = open
      if (!open) void c.setFocalOffset(0, 0, 0, animated())
    })
    registerCamera({
      goTo(view: ViewId, instant?: boolean) {
        const p = VIEWS[view]
        // portrait screens see less width, and the bottom sheet hides the lower half: back the camera off
        const dom = gl.domElement
        const aspect = dom.clientWidth / Math.max(1, dom.clientHeight)
        const compact = window.matchMedia('(max-width: 760px)').matches
        let f = aspect < 1.2 ? 1 + (1.2 - aspect) * 0.75 : 1
        if (compact && panelOpen()) f *= 1.45
        const pos = p.pos.map((v, i) => p.target[i] + (v - p.target[i]) * f) as [number, number, number]
        void c.setLookAt(...pos, ...p.target, animated(instant))
        applyOffset(Math.hypot(pos[0] - p.target[0], pos[1] - p.target[1], pos[2] - p.target[2]), instant)
      },
      zoom(f: number) {
        void c.dolly(c.distance * 0.28 * f, !reducedMotion)
      },
      rotate(az: number, pol: number) {
        void c.rotate(THREE.MathUtils.degToRad(az), THREE.MathUtils.degToRad(pol), !reducedMotion)
      },
    })
    const onStart = () => store.set({ interacted: true, view: null })
    c.addEventListener('controlstart', onStart)
    return () => {
      c.removeEventListener('controlstart', onStart)
      unsub()
      registerCamera(null)
    }
  }, [reducedMotion, gl])
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={0.55}
      maxDistance={34}
      minPolarAngle={0.12}
      maxPolarAngle={1.45}
      minAzimuthAngle={-1.75}
      maxAzimuthAngle={1.75}
      smoothTime={reducedMotion ? 0 : 0.45}
      draggingSmoothTime={0.1}
      dollySpeed={0.7}
    />
  )
}

function Hotspots() {
  const labels = useStore((s) => s.labels)
  const selected = useStore((s) => s.selected)
  const hovered = useStore((s) => s.hovered)
  if (!labels) return null
  return (
    <>
      {HOTSPOTS.map((h) => {
        const id = h.id as ObjectId
        const Icon = ICONS[id]
        const on = selected === id
        return (
          <Html key={id} position={h.pos as unknown as [number, number, number]} center zIndexRange={[40, 0]} style={{ pointerEvents: 'auto' }}>
            <button
              type="button"
              className={`hotspot${on ? ' is-on' : ''}${hovered === id ? ' is-hover' : ''}`}
              aria-pressed={on}
              aria-label={`Inspect ${boothObjects[id].title}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => selectObject(on ? null : id)}
              onPointerEnter={() => store.set({ hovered: id })}
              onPointerLeave={() => store.get().hovered === id && store.set({ hovered: null })}
            >
              <span className="hotspot-dot" aria-hidden="true">
                <Icon size={16} strokeWidth={2.2} />
              </span>
              <span className="hotspot-label">{boothObjects[id].kicker}</span>
            </button>
          </Html>
        )
      })}
    </>
  )
}

/** Marks the scene ready once the first frame with all assets has rendered. */
function Ready() {
  const done = useRef(false)
  const invalidate = useThree((st) => st.invalidate)
  // in on-demand mode (reduced motion) nothing else asks for the first full frame
  useEffect(() => invalidate(), [invalidate])
  useFrame(() => {
    if (done.current) return
    done.current = true
    requestAnimationFrame(() => store.set({ sceneReady: true }))
  })
  return null
}

function ProgressReporter() {
  const progress = useProgress((s) => s.progress)
  useEffect(() => store.set({ progress }), [progress])
  return null
}

/** Requests a frame whenever the viewer becomes visible again (needed for on-demand rendering). */
function WakeOnVisible({ visible }: { visible: boolean }) {
  const invalidate = useThree((st) => st.invalidate)
  useEffect(() => {
    if (visible) invalidate()
  }, [visible, invalidate])
  return null
}

function ContextGuard() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const el = gl.domElement
    const lost = (e: Event) => {
      e.preventDefault()
      store.set({ mode: 'image', sceneReady: false })
    }
    el.addEventListener('webglcontextlost', lost)
    return () => el.removeEventListener('webglcontextlost', lost)
  }, [gl])
  return null
}

function Lights({ quality }: { quality: Quality }) {
  const s = SETTINGS[quality]
  const light = useRef<THREE.DirectionalLight>(null)
  const scene = useThree((st) => st.scene)
  const spotTarget = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (!light.current) return
    light.current.target.position.set(0, 0, -3)
    scene.add(light.current.target)
    const t = light.current.target
    return () => void scene.remove(t)
  }, [scene])
  return (
    <>
      <hemisphereLight args={['#EEF4FF', '#B99C78', 0.55]} />
      <ambientLight intensity={0.08} />
      <directionalLight
        ref={light}
        position={[-7, 14, 9]}
        intensity={2.6}
        color="#FFF7EC"
        castShadow={s.shadowMap > 0}
        shadow-mapSize={[s.shadowMap || 512, s.shadowMap || 512]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
      />
      {quality !== 'low' && (
        <>
          <primitive object={spotTarget} position={[0, 1.2, -4.8]} />
          <spotLight position={[0, 5.2, 1.2]} angle={0.7} penumbra={0.9} intensity={38} distance={14} decay={2} color="#FFFFFF" target={spotTarget} />
        </>
      )}
      <Environment resolution={quality === 'high' ? 256 : 128} frames={1}>
        <color attach="background" args={['#C9D4E8']} />
        <Lightformer form="rect" intensity={1.5} position={[0, 9, 0]} rotation-x={Math.PI / 2} scale={[26, 6, 1]} />
        <Lightformer form="rect" intensity={1.0} position={[0, 9, -8]} rotation-x={Math.PI / 2} scale={[26, 3, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#DCE8FF" position={[-14, 4, 0]} rotation-y={Math.PI / 2} scale={[20, 3, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#FFE8CF" position={[14, 4, 0]} rotation-y={-Math.PI / 2} scale={[20, 3, 1]} />
      </Environment>
    </>
  )
}

function Scene({ quality, reducedMotion }: { quality: Quality; reducedMotion: boolean }) {
  const animate = !reducedMotion
  return (
    <>
      <Court quality={quality} />
      <Booth quality={quality} animate={animate} />
      <Students quality={quality} animate={animate} />
      <EventDressing quality={quality} animate={animate} />
      <BleacherCrowd count={SETTINGS[quality].crowd} />
      <ContactShadows position={[0, 0.024, -2.6]} scale={[10, 7]} blur={2.2} opacity={0.42} far={2.2} resolution={quality === 'high' ? 1024 : 512} frames={1} color="#0B1B4D" />
      <Hotspots />
      <Ready />
    </>
  )
}

export default function Experience({ quality, reducedMotion, visible }: ExperienceProps) {
  const s = SETTINGS[quality]
  const [dpr, setDpr] = useState(Math.min(s.dpr, typeof window !== 'undefined' ? window.devicePixelRatio : 1))

  useEffect(() => {
    store.set({ sceneReady: false })
    return () => {
      store.set({ sceneReady: false, hovered: null })
      document.body.style.cursor = ''
      disposeShared()
      clearImageTextures()
    }
  }, [])

  return (
    <Canvas
      shadows={s.shadowMap > 0}
      dpr={dpr}
      frameloop={!visible ? 'never' : reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: s.antialias, powerPreference: 'high-performance' }}
      camera={{ fov: 34, near: 0.1, far: 160, position: VIEWS.initial.pos }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <color attach="background" args={['#E6ECF7']} />
      <fog attach="fog" args={['#E6ECF7', 45, 110]} />
      <PerformanceMonitor flipflops={3} onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(s.dpr, window.devicePixelRatio))} onFallback={() => setDpr(1)} />
      <ContextGuard />
      <ProgressReporter />
      <WakeOnVisible visible={visible} />
      <Lights quality={quality} />
      <Suspense fallback={null}>
        <Scene quality={quality} reducedMotion={reducedMotion} />
      </Suspense>
      <Controls reducedMotion={reducedMotion} />
    </Canvas>
  )
}
