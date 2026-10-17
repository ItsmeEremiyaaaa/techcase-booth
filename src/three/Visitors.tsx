import { useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import { Html } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useStore, type Quality } from '../lib/store'
import { Interactive } from './Interactive'
import { Person, type Gait, type PersonProps, type Pose } from './People'
import { STATIONS, claim, clearReaction, release, releaseFloor, resetCrowd, setReaction, takeFloor, type StationId } from './crowd'

/*
 * Visitors who walk around the gym and use the booth: they try the demo phones, take a brochure,
 * read the roll-up and scan the QR code, and the team turns to talk to them. Click one to say hi.
 */

type XZ = [number, number]
type Look = Omit<PersonProps, 'position' | 'rotation' | 'pose' | 'animate' | 'castShadow' | 'gait' | 'phase'>

/** how the team member at that part of the table responds */
interface Reply {
  pose?: Pose
  /** pose after `after` seconds (defaults to `pose`) */
  later?: Pose
  say?: string
  after?: number
}

type Step =
  | { kind: 'go'; path: XZ[]; pose?: Pose }
  | { kind: 'at'; stations: StationId[]; pose: Pose; secs: number; say?: string; reply?: Reply; patience?: number }
  | { kind: 'stay'; pose: Pose; secs: number; say?: string; reply?: Reply }
  | { kind: 'idle'; pose: Pose; secs: number; face: number; say?: string }

interface WalkerDef {
  id: string
  look: Look
  /** walks alongside, half a metre to the left */
  friend?: Look & { pose: Pose }
  speed: number
  steps: Step[]
  start: { step: number; pos?: XZ; station?: StationId }
  /** placement when motion is reduced */
  still: { pos: XZ; yaw: number; pose: Pose }
  /** only on Medium and High */
  extra?: boolean
  /** belongs to the booth's visitor area (hover highlight + Visitors panel) */
  booth: boolean
}

const S = STATIONS

const WALKERS: WalkerDef[] = [
  {
    id: 'demo',
    booth: true,
    look: { skin: '#8D5A3B', hair: '#120D0A', hairStyle: 'buzz', outfit: 'smcbi-m', backpack: '#2E3440' },
    speed: 1.05,
    steps: [
      { kind: 'go', path: [[-3.2, 1.6], [-1.05, -1.25]] },
      { kind: 'at', stations: ['t2', 't3', 't4', 't1'], pose: 'lean', secs: 7, say: 'Ooh, a boss battle!', reply: { pose: 'talk', say: 'Beat it for bonus XP!', after: 2.8 } },
      { kind: 'at', stations: ['t1'], pose: 'reach', secs: 1.6, patience: 6 },
      { kind: 'stay', pose: 'read', secs: 2.4, say: 'Taking one for my blockmates.' },
      { kind: 'go', path: [[-1.35, -1.3], [-3.6, 1.8], [-7.5, 6.2]], pose: 'read' },
    ],
    start: { step: 1, station: 't2' },
    still: { pos: S.t2.pos, yaw: S.t2.face, pose: 'lean' },
  },
  {
    id: 'scanner',
    booth: true,
    look: { skin: '#F0C9A6', hair: '#3A2414', hairStyle: 'ponytail', top: '#5BA79A', bottom: '#2F3A55', scale: 0.95 },
    speed: 1.1,
    steps: [
      { kind: 'go', path: [[2.9, -0.95], [1.35, -1.45]] },
      { kind: 'at', stations: ['t4', 't3'], pose: 'lean', secs: 5.5, say: '20-second rounds? Let’s go!', reply: { pose: 'talk', say: 'Think fast, answer smart!', after: 2.4 } },
      { kind: 'at', stations: ['qr'], pose: 'scan', secs: 5, say: 'Scanned! It opens in the browser.', reply: { pose: 'wave', later: 'talk', say: 'Tap Install to keep it!', after: 2.2 } },
      { kind: 'go', path: [[2.1, -1.0], [4.2, 1.6], [7.4, 5.2]], pose: 'phone' },
    ],
    start: { step: 0, pos: [3.9, 0.9] },
    still: { pos: S.qr.pos, yaw: S.qr.face, pose: 'scan' },
  },
  {
    id: 'reader',
    booth: true,
    look: { skin: '#E0B08A', hair: '#2B1B12', hairStyle: 'long', outfit: 'smcbi-f', scale: 0.94 },
    speed: 1.0,
    steps: [
      { kind: 'go', path: [[-3.4, 0.3], [-1.45, -1.3]] },
      { kind: 'at', stations: ['banner'], pose: 'point', secs: 5, say: 'Study. Compete. Level Up!' },
      { kind: 'at', stations: ['t1'], pose: 'reach', secs: 1.6, patience: 7 },
      { kind: 'stay', pose: 'read', secs: 2.6, say: 'Can I take one?', reply: { pose: 'talk', say: 'Sure! The QR is inside.', after: 0.9 } },
      { kind: 'go', path: [[-1.35, -1.3], [-3.4, 0.4], [-7.0, 2.6]], pose: 'read' },
    ],
    start: { step: 1, station: 'banner' },
    still: { pos: S.banner.pos, yaw: S.banner.face, pose: 'point' },
  },
  {
    id: 'judge',
    booth: true,
    extra: true,
    look: { skin: '#C68A62', hair: '#2A2622', hairStyle: 'side', top: '#2F3B57', bottom: '#2B2F38', shoes: '#1A1A1A', longSleeves: true },
    speed: 0.85,
    steps: [
      { kind: 'go', path: [[-2.9, -1.25], [-0.6, -1.25]], pose: 'clipboard' },
      { kind: 'at', stations: ['t3', 't2'], pose: 'clipboard', secs: 8, patience: 10, say: 'How does the weekly league work?', reply: { pose: 'present', say: 'Top 5 in each league move up every week!', after: 3 } },
      { kind: 'go', path: [[1.2, -1.2], [3.1, -1.35], [6.0, -2.35]], pose: 'clipboard' },
      { kind: 'idle', pose: 'clipboard', secs: 6, face: 2.36 },
      { kind: 'go', path: [[3.1, -1.3], [-2.9, -1.25], [-5.9, -2.1]], pose: 'clipboard' },
      { kind: 'idle', pose: 'clipboard', secs: 6, face: -2.43 },
    ],
    start: { step: 0, pos: [-5.9, -2.1] },
    still: { pos: [-1.05, -1.55], yaw: 2.75, pose: 'clipboard' },
  },
  {
    id: 'friends',
    booth: false,
    extra: true,
    look: { skin: '#A86F4C', hair: '#1B1410', hairStyle: 'short', outfit: 'smcbi-m', backpack: '#5B3FC0' },
    friend: { skin: '#6E432B', hair: '#120D0A', hairStyle: 'cap', top: '#F1C453', bottom: '#22262E', backpack: '#2E3440', pose: 'phone' },
    speed: 0.95,
    steps: [{ kind: 'go', path: [[-9.5, 2.6], [9.5, 2.6], [10.6, 3.5], [9.5, 4.4], [-9.5, 4.4], [-10.6, 3.5]], pose: 'talk' }],
    start: { step: 0, pos: [-2, 2.6] },
    still: { pos: [-4.2, 3.0], yaw: 1.4, pose: 'talk' },
  },
]

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
/** how long a line stays up, and how long it may wait for someone else to finish */
const SAY_SECS = 3.8
const SAY_WAIT = 3

interface Runtime {
  i: number
  mode: 'walk' | 'seek' | 'station' | 'idle'
  path: XZ[]
  /** claim the station when the current path ends */
  arriving: boolean
  station: StationId | null
  want: StationId[]
  waited: number
  timer: number
  elapsed: number
  replied: boolean
  x: number
  z: number
  yaw: number
  poke: number
  /** a line waiting for its turn, how long it may still wait, and how long the shown line has left */
  pending: string | null
  pendingT: number
  sayT: number
}

function Walker({ def, shadow, bubbles }: { def: WalkerDef; shadow: boolean; bubbles: boolean }) {
  const root = useRef<Group>(null)
  const gait = useRef<Gait>({ speed: 0 })
  const bubbleEl = useRef<HTMLDivElement>(null)
  const [pose, setPose] = useState<Pose>(() => {
    const s = def.steps[def.start.step]
    return s.kind === 'go' ? (s.pose ?? 'walk') : s.pose
  })
  const [say, setSay] = useState<string | null>(null)
  const [poked, setPoked] = useState(false)

  const rt = useRef<Runtime | null>(null)
  const init = useMemo(() => {
    const st = def.start.station ? S[def.start.station] : null
    const pos = st ? st.pos : (def.start.pos ?? def.still.pos)
    return { x: pos[0], z: pos[1], yaw: st ? st.face : def.still.yaw }
  }, [def])

  // ---- step machine (runs inside useFrame) ----
  const api = useMemo(() => {
    const hush = (r: Runtime) => {
      r.pending = null
      r.sayT = 0
      releaseFloor(def.id)
      setSay(null)
    }
    const speak = (r: Runtime, text: string | undefined) => {
      hush(r)
      if (!text) return
      r.pending = text
      r.pendingT = SAY_WAIT
    }
    const leave = (r: Runtime) => {
      if (!r.station) return
      release(r.station, def.id)
      const m = S[r.station].member
      if (m) clearReaction(m, def.id)
      r.station = null
    }
    const react = (r: Runtime, reply: Reply | undefined, late: boolean) => {
      if (!r.station) return
      const m = S[r.station].member
      if (!m) return
      // the team member always turns to the visitor; pose and line follow the script
      const pose = late ? (reply?.later ?? reply?.pose) : reply?.pose
      const say = late || !reply?.after ? reply?.say : undefined
      setReaction(m, { by: def.id, look: S[r.station].pos, pose, say })
    }
    const arriveStation = (r: Runtime) => {
      const s = def.steps[r.i]
      if (s.kind !== 'at') return
      r.mode = 'station'
      r.timer = s.secs
      r.elapsed = 0
      r.replied = false
      setPose(s.pose)
      speak(r, s.say)
      react(r, s.reply, false)
    }
    const begin = (r: Runtime, i: number) => {
      r.i = i
      r.elapsed = 0
      r.replied = false
      r.arriving = false
      const s = def.steps[i]
      // already standing at one of the wanted spots: just carry on there
      if (s.kind === 'at' && r.station && s.stations.includes(r.station)) {
        arriveStation(r)
        return
      }
      const prefix: XZ[] = []
      if (s.kind !== 'stay' && r.station) {
        prefix.push(S[r.station].approach)
        leave(r)
      }
      if (s.kind === 'go') {
        r.mode = 'walk'
        r.path = [...prefix, ...s.path]
        setPose(s.pose ?? 'walk')
        hush(r)
      } else if (s.kind === 'at') {
        r.mode = 'seek'
        r.path = prefix
        r.want = s.stations
        r.waited = 0
        setPose('walk')
        hush(r)
      } else {
        r.mode = s.kind === 'stay' ? 'station' : 'idle'
        r.timer = s.secs
        setPose(s.pose)
        speak(r, s.say)
        if (s.kind === 'stay') react(r, s.reply, false)
      }
    }
    const next = (r: Runtime, skip = false) => {
      let i = (r.i + 1) % def.steps.length
      // gave up on a spot: also skip what was meant to happen there
      if (skip) while (def.steps[i].kind === 'stay') i = (i + 1) % def.steps.length
      begin(r, i)
    }
    return { hush, leave, react, arriveStation, begin, next }
  }, [def])

  if (!rt.current) {
    const r: Runtime = { i: def.start.step, mode: 'walk', path: [], arriving: false, station: null, want: [], waited: 0, timer: 0, elapsed: 0, replied: false, ...init, poke: 0, pending: null, pendingT: 0, sayT: 0 }
    rt.current = r
  }

  // claim the starting spot (and give it back on unmount)
  useEffect(() => {
    const r = rt.current!
    if (def.start.station && claim(def.start.station, def.id)) {
      r.station = def.start.station
      r.x = S[def.start.station].pos[0]
      r.z = S[def.start.station].pos[1]
      api.arriveStation(r)
    } else {
      api.begin(r, def.start.step)
    }
    return () => {
      api.leave(r)
      api.hush(r)
    }
  }, [api, def])

  useFrame(({ camera }, delta) => {
    const r = rt.current
    const g = root.current
    if (!r || !g) return
    const dt = Math.min(delta, 0.1)

    if (r.poke > 0) {
      r.poke -= dt
      if (r.poke <= 0) {
        setPoked(false)
      }
    }

    // look for a free spot
    if (r.mode === 'seek') {
      for (const id of r.want) {
        if (claim(id, def.id)) {
          r.station = id
          r.path.push(S[id].approach, S[id].pos)
          r.mode = 'walk'
          r.arriving = true
          break
        }
      }
      if (r.mode === 'seek' && r.path.length === 0) {
        r.waited += dt
        const s = def.steps[r.i]
        if (r.waited > (s.kind === 'at' ? (s.patience ?? 8) : 8)) api.next(r, true)
      }
    }

    // move along the path
    let heading: number | null = null
    const moving = (r.mode === 'walk' || r.mode === 'seek') && r.path.length > 0 && r.poke <= 0
    if (moving) {
      const [tx, tz] = r.path[0]
      const dx = tx - r.x
      const dz = tz - r.z
      const dist = Math.hypot(dx, dz)
      const last = r.path.length === 1
      const want = last ? Math.min(def.speed, 0.3 + dist * 1.6) : def.speed
      gait.current.speed += (want - gait.current.speed) * (1 - Math.exp(-dt * 4))
      const step = Math.max(gait.current.speed, 0.15) * dt
      if (dist > 1e-4) heading = Math.atan2(dx, dz)
      if (step >= dist) {
        r.x = tx
        r.z = tz
        r.path.shift()
        if (r.path.length === 0) {
          if (r.arriving) {
            r.arriving = false
            api.arriveStation(r)
          } else if (r.mode === 'walk') api.next(r)
        }
      } else {
        r.x += (dx / dist) * step
        r.z += (dz / dist) * step
      }
    } else {
      gait.current.speed += (0 - gait.current.speed) * (1 - Math.exp(-dt * 8))
      if (gait.current.speed < 0.02) gait.current.speed = 0
    }

    // timed steps
    if (r.mode === 'station' || r.mode === 'idle') {
      r.elapsed += dt
      const s = def.steps[r.i]
      if ((s.kind === 'at' || s.kind === 'stay') && s.reply?.after && !r.replied && r.elapsed >= s.reply.after) {
        r.replied = true
        api.react(r, s.reply, true)
      }
      if (r.poke <= 0) {
        r.timer -= dt
        if (r.timer <= 0) api.next(r)
      }
    }

    // facing
    let face = heading ?? r.yaw
    if (r.poke > 0) face = Math.atan2(camera.position.x - r.x, camera.position.z - r.z)
    else if (r.mode === 'station' && r.station) face = S[r.station].face
    else if (r.mode === 'idle') {
      const s = def.steps[r.i]
      if (s.kind === 'idle') face = s.face
    }
    r.yaw += wrap(face - r.yaw) * (1 - Math.exp(-dt * 6))
    g.position.set(r.x, 0, r.z)
    g.rotation.y = r.yaw

    // speech: wait for whoever is talking to finish, then show the line for a few seconds
    if (r.pending) {
      r.pendingT -= dt
      if (r.pendingT <= 0) r.pending = null
      else if (takeFloor(def.id)) {
        setSay(r.pending)
        r.pending = null
        r.sayT = SAY_SECS
      }
    }
    if (r.sayT > 0) {
      r.sayT -= dt
      if (r.sayT <= 0) {
        releaseFloor(def.id)
        setSay(null)
      }
    }

    // speech bubbles fade out when the camera is far away, or so close the visitor is hidden
    const el = bubbleEl.current
    if (el) {
      const flat = Math.hypot(camera.position.x - r.x, camera.position.z - r.z)
      const far = flat > 15 || Math.hypot(flat, Math.max(0, camera.position.y - 1.75)) < 1.1
      if (el.classList.contains('far') !== far) el.classList.toggle('far', far)
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return
    const r = rt.current
    if (!r) return
    r.poke = 2.6
    setPoked(true)
  }
  const cursor = def.booth
    ? {}
    : {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          document.body.style.cursor = ''
        },
      }

  const scale = def.look.scale ?? 1
  const text = poked ? 'Hi! Have you tried StudyQuest?' : say
  return (
    <group ref={root} position={[init.x, 0, init.z]} rotation={[0, init.yaw, 0]}>
      <group onClick={onClick} {...cursor}>
        <Person position={[0, 0, 0]} {...def.look} pose={poked ? 'wave' : pose} gait={gait} animate phase={init.x * 2.1} castShadow={shadow} />
        {def.friend && <Person position={[0.55, 0, -0.08]} {...def.friend} gait={gait} animate phase={init.x * 1.3 + 2} castShadow={shadow} headYaw={-0.35} />}
      </group>
      {bubbles && text && (
        <Html position={[0, 2.1 * scale, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div ref={bubbleEl} className={`bubble${poked ? ' hi' : ''}`}>
            {text}
          </div>
        </Html>
      )}
    </group>
  )
}

/** Visitors standing still (reduced motion), in the spots their script would show. */
function StillWalker({ def, shadow }: { def: WalkerDef; shadow: boolean }) {
  return (
    <group position={[def.still.pos[0], 0, def.still.pos[1]]} rotation={[0, def.still.yaw, 0]}>
      <Person position={[0, 0, 0]} {...def.look} pose={def.still.pose} castShadow={shadow} />
      {def.friend && <Person position={[0.55, 0, -0.08]} {...def.friend} castShadow={shadow} headYaw={-0.35} />}
    </group>
  )
}

export function Visitors({ quality, animate }: { quality: Quality; animate: boolean }) {
  const shadow = quality !== 'low'
  const labels = useStore((s) => s.labels)
  const walkers = WALKERS.filter((w) => quality !== 'low' || !w.extra)
  useEffect(() => () => resetCrowd(), [])

  const render = (w: WalkerDef) => (animate ? <Walker key={w.id} def={w} shadow={shadow} bubbles={labels} /> : <StillWalker key={w.id} def={w} shadow={shadow} />)

  return (
    <group>
      <Interactive id="students" marker={[4.0, 2.2]} markerAt={[0.2, 0.02, -1.55]}>
        {/* watching the demo from the side */}
        <Person position={[2.7, 0, -2.3]} rotation={-2.13} skin="#C68A62" hair="#120D0A" hairStyle="short" outfit="smcbi-m" pose="crossed" headYaw={0.2} animate={animate} phase={5.5} castShadow={shadow} />
        {/* waiting near the roll-up, checking their phone */}
        <Person position={[-3.25, 0, -2.35]} rotation={1.91} skin="#6E432B" hair="#120D0A" hairStyle="buzz" outfit="smcbi-m" pose="phone" backpack="#E9935B" animate={animate} phase={6.1} castShadow={shadow} />
        {quality !== 'low' && (
          <>
            {/* two friends comparing scores */}
            <Person position={[4.25, 0, -1.15]} rotation={0.98} scale={0.95} skin="#F0C9A6" hair="#2B1B12" hairStyle="bun" outfit="smcbi-f" pose="talk" animate={animate} phase={3.1} castShadow={shadow} />
            <Person position={[4.7, 0, -0.85]} rotation={-2.16} skin="#A86F4C" hair="#1B1410" hairStyle="side" top="#E9935B" bottom="#22262E" pose="phone" headPitch={-0.1} animate={animate} phase={4.2} castShadow={shadow} />
          </>
        )}
        {walkers.filter((w) => w.booth).map(render)}
      </Interactive>
      {walkers.filter((w) => !w.booth).map(render)}
    </group>
  )
}
