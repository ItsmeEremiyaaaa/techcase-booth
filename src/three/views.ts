import type { ViewId } from '../lib/store'

/** Camera presets: [position, target] in world metres. The booth sits at z ≈ -3.4 facing +Z. */
export const VIEWS: Record<ViewId, { pos: [number, number, number]; target: [number, number, number]; label: string }> = {
  initial: { pos: [6.4, 5.3, 9.6], target: [0, 0.95, -2.9], label: 'Overview' },
  court: { pos: [17, 17.5, 22], target: [0, 0, -1.2], label: 'Full court' },
  booth: { pos: [4.6, 3.0, 4.4], target: [0, 1.1, -3.5], label: 'Booth' },
  table: { pos: [2.25, 2.25, -2.35], target: [0, 0.78, -3.2], label: 'Table' },
  devices: { pos: [0.1, 1.72, -1.75], target: [0, 0.9, -3.3], label: 'Devices' },
  banner: { pos: [-1.6, 1.9, -0.45], target: [-2.0, 1.15, -4.1], label: 'Banner' },
  backdrop: { pos: [0.6, 2.3, 1.6], target: [0, 1.35, -4.85], label: 'Backdrop' },
  qr: { pos: [3.4, 1.75, -0.9], target: [1.6, 0.95, -2.95], label: 'QR stands' },
  students: { pos: [4.6, 2.9, 2.6], target: [0.3, 0.9, -1.9], label: 'Visitors' },
}

/** Floating hotspot pins (world positions). */
export const HOTSPOTS = [
  { id: 'backdrop', pos: [1.1, 2.78, -4.8] },
  { id: 'banner', pos: [-2.0, 2.38, -4.1] },
  { id: 'table', pos: [-0.86, 0.95, -2.86] },
  { id: 'devices', pos: [0.05, 1.3, -3.32] },
  { id: 'qr', pos: [2.0, 1.72, -2.85] },
  { id: 'students', pos: [1.05, 2.05, -1.0] },
] as const
