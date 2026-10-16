import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { team, type Member } from '../content/team'
import { selectMember, store, useStore } from '../lib/store'
import { FloorMarker, HighlightProvider, type HlState } from './Interactive'
import { Person } from './People'
import { TEAM_SPOTS } from './views'

const SHIRT = '#3A2A20' // dark brown StudyQuest team shirts (orange lanyard + logo patch)
const TAG_Y = 2.02

function TeamMember({ m, animate, shadow }: { m: Member; animate: boolean; shadow: boolean }) {
  const s = TEAM_SPOTS[m.id]
  const selected = useStore((st) => st.member === m.id)
  const hovered = useStore((st) => st.hoveredMember === m.id)
  const labels = useStore((st) => st.labels)
  // names are spelled out when the camera is on the team; elsewhere the tags shrink to avatars
  const expanded = useStore((st) => st.team || st.member !== null || st.view === 'team' || (st.view?.startsWith('member-') ?? false))
  const state: HlState = selected ? 'selected' : hovered ? 'hover' : 'none'

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

  return (
    <group>
      <group onPointerOver={over} onPointerOut={out} onClick={click}>
        <HighlightProvider value={state}>
          <Person
            position={[s.x, 0.02, s.z]}
            rotation={s.rot}
            scale={s.scale}
            skin={s.skin}
            hair={s.hair}
            hairStyle={s.hairStyle}
            top={SHIRT}
            bottom={s.bottom}
            // the selected member turns to wave at the visitor
            pose={selected ? 'wave' : s.pose}
            headYaw={s.headYaw}
            headPitch={selected ? 0 : s.headPitch}
            lanyard
            lanyardColor="#E8935C"
            rep
            patchColor="#E8935C"
            animate={animate}
            phase={s.x * 3 + 0.5}
            castShadow={shadow}
          />
        </HighlightProvider>
      </group>
      {state !== 'none' && <FloorMarker size={[0.7, 0.7]} position={[s.x, 0.02, s.z]} strong={selected} />}
      {labels && (
        <Html position={[s.x, TAG_Y * (s.scale ?? 1), s.z]} center zIndexRange={[40, 0]} style={{ pointerEvents: 'auto' }}>
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
