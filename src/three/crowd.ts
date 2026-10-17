import { useSyncExternalStore } from 'react'
import type { MemberId } from '../content/team'
import type { Pose } from './People'

/*
 * Shared state for the walking visitors: which booth spots are taken, and how the team reacts
 * (turn to face a visitor, change pose, say something) while someone is at their part of the table.
 */

export type StationId = 't1' | 't2' | 't3' | 't4' | 'qr' | 'banner'

export interface Station {
  /** where the visitor stands (world x, z) */
  pos: [number, number]
  /** the direction they face while there (yaw, radians; 0 = +z) */
  face: number
  /** where they step in from and back out to, so nobody walks through a neighbour */
  approach: [number, number]
  /** the team member who reacts */
  member?: MemberId
}

const toward = (from: [number, number], to: [number, number]) => Math.atan2(to[0] - from[0], to[1] - from[1])

export const STATIONS: Record<StationId, Station> = {
  // along the front of the table (front edge at z = -2.87)
  t1: { pos: [-0.72, -2.42], face: Math.PI, approach: [-0.72, -1.8], member: 'peter' },
  t2: { pos: [-0.26, -2.4], face: Math.PI, approach: [-0.26, -1.8], member: 'jeremiah' },
  t3: { pos: [0.26, -2.4], face: Math.PI, approach: [0.26, -1.8], member: 'jeremiah' },
  t4: { pos: [0.72, -2.42], face: Math.PI, approach: [0.72, -1.8], member: 'sharwin' },
  // the floor QR sign, next to Joemar
  qr: { pos: [1.58, -2.4], face: toward([1.58, -2.4], [2.0, -2.85]), approach: [1.52, -1.68], member: 'joemar' },
  // in front of the roll-up banner
  banner: { pos: [-1.62, -2.95], face: toward([-1.62, -2.95], [-2.0, -4.1]), approach: [-1.45, -1.75] },
}

/* ---------------- spot reservations ---------------- */
const taken = new Map<StationId, string>()

export function claim(id: StationId, by: string) {
  const owner = taken.get(id)
  if (owner && owner !== by) return false
  taken.set(id, by)
  return true
}

export function release(id: StationId, by: string) {
  if (taken.get(id) === by) taken.delete(id)
}

/* ---------------- who is talking ----------------
 * Only one visitor speech bubble at a time, so lines never pile up on top of each other. */
let floor: string | null = null

export function takeFloor(by: string) {
  if (floor && floor !== by) return false
  floor = by
  return true
}

export function releaseFloor(by: string) {
  if (floor === by) floor = null
}

/* ---------------- team reactions ---------------- */
export interface Reaction {
  /** the visitor that triggered it (only they can change or clear it) */
  by: string
  pose?: Pose
  /** world point to turn toward */
  look?: [number, number]
  say?: string
}

const reactions = new Map<MemberId, Reaction>()
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

export function setReaction(id: MemberId, r: Reaction) {
  const cur = reactions.get(id)
  if (cur && cur.by !== r.by) return
  reactions.set(id, r)
  emit()
}

export function clearReaction(id: MemberId, by: string) {
  if (reactions.get(id)?.by !== by) return
  reactions.delete(id)
  emit()
}

const subscribe = (f: () => void) => {
  subs.add(f)
  return () => void subs.delete(f)
}

export function useReaction(id: MemberId) {
  return useSyncExternalStore(
    subscribe,
    () => reactions.get(id),
    () => undefined,
  )
}

/** Called when the 3D scene unmounts (e.g. a quality change restarts it). */
export function resetCrowd() {
  taken.clear()
  reactions.clear()
  floor = null
  emit()
}
