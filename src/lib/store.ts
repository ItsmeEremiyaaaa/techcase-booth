import { useSyncExternalStore } from 'react'
import type { ObjectId } from '../content/booth'
import type { Units } from './units'
import { detectQuality } from './device'

export type Quality = 'high' | 'medium' | 'low'
export type QualityMode = 'auto' | Quality
export type ViewId = 'initial' | 'court' | 'booth' | 'table' | 'banner' | 'devices' | 'qr' | 'students' | 'backdrop'

export interface CameraApi {
  goTo: (view: ViewId, instant?: boolean) => void
  zoom: (factor: number) => void
  rotate: (azimuthDeg: number, polarDeg: number) => void
}

interface State {
  selected: ObjectId | null
  hovered: ObjectId | null
  qualityMode: QualityMode
  autoQuality: Quality
  labels: boolean
  sceneReady: boolean
  /** 3D vs. static image view (image is used when WebGL is missing or the scene fails) */
  mode: '3d' | 'image'
  /** the "About StudyQuest" panel */
  about: boolean
  /** the welcome card shown on first load */
  intro: boolean
  interacted: boolean
  units: Units
  view: ViewId | null
  progress: number
  failed: boolean
}

let state: State = {
  selected: null,
  hovered: null,
  qualityMode: 'auto',
  autoQuality: typeof window !== 'undefined' ? detectQuality() : 'high',
  labels: true,
  sceneReady: false,
  mode: '3d',
  about: false,
  intro: true,
  interacted: false,
  units: 'metric',
  view: 'initial',
  progress: 0,
  failed: false,
}

const listeners = new Set<() => void>()

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    let changed = false
    for (const k in patch) {
      const key = k as keyof State
      if (state[key] !== patch[key]) changed = true
    }
    if (!changed) return
    state = { ...state, ...patch }
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state))
}

export const effectiveQuality = (s: State): Quality => (s.qualityMode === 'auto' ? s.autoQuality : s.qualityMode)

/* ---- camera bridge: the 3D scene registers its controls here ---- */
let camera: CameraApi | null = null
let pendingView: ViewId | null = null

export function registerCamera(api: CameraApi | null) {
  camera = api
  if (api) {
    // jump straight to whatever view was requested before the scene existed (or the current one)
    api.goTo(pendingView ?? state.view ?? 'initial', true)
    pendingView = null
  }
}

export const cameraApi = {
  goTo(view: ViewId) {
    store.set({ view })
    if (camera) camera.goTo(view)
    else pendingView = view
  },
  zoom(f: number) {
    camera?.zoom(f)
  },
  rotate(a: number, p: number) {
    camera?.rotate(a, p)
  },
  get ready() {
    return camera !== null
  },
}

/** The camera view used when an object is selected. */
export const viewForObject: Record<ObjectId, ViewId> = {
  table: 'table',
  backdrop: 'backdrop',
  banner: 'banner',
  devices: 'devices',
  qr: 'qr',
  students: 'students',
}

export function selectObject(id: ObjectId | null, moveCamera = true) {
  store.set({ selected: id, about: false, intro: false, interacted: true })
  if (id && moveCamera) cameraApi.goTo(viewForObject[id])
}

export function openAbout() {
  store.set({ about: true, selected: null, intro: false, interacted: true })
  cameraApi.goTo('booth')
}

export function closePanels() {
  store.set({ about: false, selected: null })
}

export function resetView() {
  store.set({ selected: null, about: false, hovered: null })
  cameraApi.goTo('initial')
}

export const panelOpen = () => !!(state.selected || state.about)
