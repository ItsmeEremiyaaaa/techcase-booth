import { useRef } from 'react'
import type { Group } from 'three'
import { Html } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { team, type Member } from '../content/team'
import { selectMember, store, useStore } from '../lib/store'
import { useReaction } from './crowd'
import { FloorMarker, HighlightProvider, type HlState } from './Interactive'
import { Person } from './People'
import { TEAM_SPOTS } from './views'

const TAG_Y = 2.02
/** booth origin on the court (keep in sync with BOOTH in Booth.tsx); team spots are booth-local */
const BOOTH_Z = -3.4

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

function TeamMember({ m, animate, shadow }: { m: Member; animate: boolean; shadow: boolean }) {
  const s = TEAM_SPOTS[m.id]
  const selected = useStore((st) => st.member === m.id)
  const hovered = useStore((st) => st.hoveredMember === m.id)
  const labels = useStore((st) => st.labels)
  // names are spelled out when the camera is on the team; elsewhere the tags shrink to avatars
  const expanded = useStore((st) => st.team || st.member !== null || st.view === 'team' || (st.view?.startsWith('member-') ?? false))
  // a visitor at this member's part of the table: turn to them, and maybe answer
  const reaction = useReaction(m.id)
  const state: HlState = selected ? 'selected' : hovered ? 'hover' : 'none'
  const turn = useRef<Group>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const said = useRef({ text: '', at: 0 })

  // turn the whole body toward a visitor (smoothly), but never more than ~75° from the usual spot
  let yawTarget = 0
  let headYaw = s.headYaw ?? 0
  if (reaction?.look && !selected) {
    const dx = reaction.look[0] - s.x
    const dz = reaction.look[1] - (BOOTH_Z + s.z)
    const rel = wrap(Math.atan2(dx, dz) - s.rot)
    yawTarget = Math.max(-1.3, Math.min(1.3, rel * 0.8))
    headYaw = Math.max(-0.5, Math.min(0.5, rel - yawTarget))
  }
  useFrame(({ camera, clock }, delta) => {
    // track when the line changed even while no bubble is mounted, so a repeated line shows again
    const text = reaction?.say ?? ''
    if (text !== said.current.text) said.current = { text, at: clock.elapsedTime }
    const el = bubble.current
    if (el) {
      const far = Math.hypot(camera.position.x - s.x, camera.position.z - (BOOTH_Z + s.z)) > 15
      const hide = far || clock.elapsedTime - said.current.at > 4.2
      if (el.classList.contains('far') !== hide) el.classList.toggle('far', hide)
    }
    const g = turn.current
    if (!g) return
    if (!animate) {
      g.rotation.y = yawTarget
      return
    }
    g.rotation.y += (yawTarget - g.rotation.y) * (1 - Math.exp(-Math.min(delta, 0.1) * 4))
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    store.set({ hoveredMember: m.id })
    document.body.style.cursor = 'pointer'
  }
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (store.get().hoveredMember === m.id) store.set({ hoveredMember: null })
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return
    e.stopPropagation()
    selectMember(m.id)
  }

  // the selected member waves at the visitor; otherwise their usual pose, or their reply to a visitor
  const pose = selected ? 'wave' : (reaction?.pose ?? s.pose)
  const scale = s.scale ?? 1
  // the lead's tag sits a little higher than his neighbours', so the expanded tags never overlap
  const tagY = TAG_Y * scale + (m.lead ? 0.24 : 0)

  return (
    <group>
      <group position={[s.x, 0.02, s.z]} rotation={[0, s.rot, 0]}>
        <group ref={turn}>
          <group onPointerOver={over} onPointerOut={out} onClick={click}>
            <HighlightProvider value={state}>
              {/* SMCBI men's uniform: light blue polo with the school seal on the pocket, dark slacks */}
              <Person
                position={[0, 0, 0]}
                scale={scale}
                skin={s.skin}
                hair={s.hair}
                hairStyle={s.hairStyle}
                outfit="smcbi-m"
                pose={pose}
                headYaw={selected ? 0 : headYaw}
                headPitch={selected || reaction ? 0.05 : s.headPitch}
                animate={animate}
                phase={s.x * 3 + 0.5}
                castShadow={shadow}
                nearHide={0.45}
              />
            </HighlightProvider>
          </group>
        </group>
      </group>
      {state !== 'none' && <FloorMarker size={[0.7, 0.7]} position={[s.x, 0.02, s.z]} strong={selected} />}
      {labels && (
        <Html position={[s.x, tagY, s.z]} center zIndexRange={[40, 0]} style={{ pointerEvents: 'auto' }}>
          <button
            type="button"
            className={`nametag${m.lead ? ' lead' : ''}${selected ? ' is-on' : ''}${hovered ? ' is-hover' : ''}${expanded ? ' expanded' : ''}`}
            aria-pressed={selected}
            aria-label={`${m.name}, ${m.role}. Show profile`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => selectMember(m.id)}
            onPointerEnter={() => store.set({ hoveredMember: m.id })}
            onPointerLeave={() => store.get().hoveredMember === m.id && store.set({ hoveredMember: null })}
          >
            <span className="nametag-avatar" style={{ background: m.color }} aria-hidden="true">
              {m.initials}
            </span>
            <span className="nametag-text">
              <b>{m.firstName}</b>
              <small>{m.role}</small>
            </span>
          </button>
        </Html>
      )}
      {labels && animate && reaction?.say && !selected && (
        <Html position={[s.x, tagY + 0.4, s.z]} center zIndexRange={[35, 0]} style={{ pointerEvents: 'none' }}>
          <div ref={bubble} className="bubble team" style={{ borderColor: m.color }}>
            <b>{m.firstName}:</b> {reaction.say}
          </div>
        </Html>
      )}
    </group>
  )
}

/** The four StudyQuest developers behind the table (booth-local coordinates). */
export function Team({ animate, shadow }: { animate: boolean; shadow: boolean }) {
  return (
    <group>
      {team.map((m) => (
        <TeamMember key={m.id} m={m} animate={animate} shadow={shadow} />
      ))}
    </group>
  )
}
