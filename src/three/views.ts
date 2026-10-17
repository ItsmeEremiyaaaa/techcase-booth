import type { MemberId } from '../content/team'
import type { ViewId } from '../lib/store'
import type { Pose, HairStyle } from './People'

type V3 = [number, number, number]

/** Booth origin on the court; the booth faces +Z. Keep in sync with BOOTH in Booth.tsx. */
const BZ = -3.4

/**
 * Where each team member stands, in booth-local coordinates [x, z], plus how they look.
 * All four wear the SMCBI men's uniform. Jeremiah stands in the centre behind the tablet.
 */
export const TEAM_SPOTS: Record<
  MemberId,
  { x: number; z: number; rot: number; pose: Pose; skin: string; hair: string; hairStyle: HairStyle; scale?: number; headYaw?: number; headPitch?: number }
> = {
  jeremiah: { x: 0, z: -0.62, rot: 0, pose: 'present', skin: '#C68A62', hair: '#15100C', hairStyle: 'curly', headPitch: 0.12 },
  peter: { x: -0.8, z: -0.58, rot: 0.22, pose: 'talk', skin: '#B97A55', hair: '#1B1410', hairStyle: 'buzz', scale: 0.98, headYaw: 0.15 },
  sharwin: { x: 0.8, z: -0.58, rot: -0.22, pose: 'crossed', skin: '#D09A70', hair: '#120D0A', hairStyle: 'side', scale: 1.01, headYaw: -0.15 },
  joemar: { x: 1.42, z: -0.12, rot: -0.75, pose: 'stand', skin: '#A86F4C', hair: '#1B1410', hairStyle: 'short', scale: 0.99 },
}

function memberView(id: MemberId): { pos: V3; target: V3; label: string } {
  const s = TEAM_SPOTS[id]
  const gx = s.x
  const gz = s.z + BZ
  // high enough to look over the heads of visitors standing at the table
  return { pos: [gx * 0.5 + (id === 'joemar' ? -0.2 : 0.25), 2.75, gz + 2.7], target: [gx, 1.38, gz], label: id }
}

/** Camera presets: [position, target] in world metres. */
export const VIEWS: Record<ViewId, { pos: V3; target: V3; label: string }> = {
  initial: { pos: [6.4, 5.3, 9.6], target: [0, 0.95, -2.9], label: 'Overview' },
  court: { pos: [17, 17.5, 22], target: [0, 0, -1.2], label: 'Full court' },
  booth: { pos: [4.6, 3.0, 4.4], target: [0, 1.1, -3.5], label: 'Booth' },
  table: { pos: [2.3, 2.7, -1.9], target: [0, 0.8, -3.2], label: 'Table' },
  devices: { pos: [0.15, 2.5, -2.1], target: [0, 0.82, -3.25], label: 'Devices' },
  banner: { pos: [-1.55, 1.9, -0.4], target: [-2.0, 1.15, -4.1], label: 'Banner' },
  backdrop: { pos: [0.6, 2.4, 1.6], target: [0, 1.35, -4.85], label: 'Backdrop' },
  qr: { pos: [3.4, 1.75, -0.9], target: [1.6, 0.95, -2.95], label: 'QR stands' },
  students: { pos: [4.6, 2.9, 2.6], target: [0.3, 0.9, -1.9], label: 'Visitors' },
  brochure: { pos: [-0.3, 1.5, -2.45], target: [-0.58, 0.76, -3.16], label: 'Brochure' },
  team: { pos: [0.85, 3.0, 0.4], target: [0.35, 1.25, -3.85], label: 'Team' },
  'member-jeremiah': memberView('jeremiah'),
  'member-peter': memberView('peter'),
  'member-sharwin': memberView('sharwin'),
  'member-joemar': memberView('joemar'),
}

/** Floating hotspot pins for booth objects (world positions). */
export const HOTSPOTS = [
  { id: 'backdrop', pos: [1.25, 2.8, -4.8] },
  { id: 'banner', pos: [-2.0, 2.42, -4.1] },
  { id: 'table', pos: [0.45, 0.5, -2.82] },
  { id: 'brochure', pos: [-0.6, 0.93, -3.1] },
  { id: 'devices', pos: [0.05, 1.3, -3.32] },
  { id: 'qr', pos: [2.0, 1.72, -2.85] },
  { id: 'students', pos: [1.05, 2.05, -1.0] },
] as const
