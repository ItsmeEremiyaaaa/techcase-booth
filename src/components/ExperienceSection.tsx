import { Component, Suspense, lazy, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import {
  Box,
  CircleHelp,
  Focus,
  Gauge,
  Hand,
  Image as ImageIcon,
  Maximize,
  Minimize,
  Minus,
  MousePointerClick,
  Plus,
  RotateCcw,
  Tag,
  Check,
} from 'lucide-react'
import { asset, site } from '../config/site'
import { boothObjects, objectOrder } from '../content/booth'
import { hasWebGL } from '../lib/device'
import { cameraApi, effectiveQuality, resetView, selectObject, store, useStore, type QualityMode, type ViewId } from '../lib/store'
import { useCoarsePointer, useInView, useReducedMotion } from '../hooks/useMedia'
import { InfoPanel } from './InfoPanel'

const Experience = lazy(() => import('../three/Experience'))

const VIEW_CHIPS: { id: ViewId; label: string }[] = [
  { id: 'initial', label: 'Overview' },
  { id: 'table', label: 'Table' },
  { id: 'banner', label: 'Banner' },
  { id: 'devices', label: 'Devices' },
  { id: 'students', label: 'Visitors' },
  { id: 'court', label: 'Full court' },
]

const QUALITY_ORDER: QualityMode[] = ['auto', 'high', 'medium', 'low']
const QUALITY_LABEL: Record<QualityMode, string> = { auto: 'Auto', high: 'High', medium: 'Medium', low: 'Low' }

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.error('3D scene failed, showing the image view instead.', err)
    store.set({ failed: true, mode: 'image', sceneReady: false })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Loader({ done }: { done: boolean }) {
  const progress = useStore((s) => s.progress)
  return (
    <div className={`loader${done ? ' done' : ''}`} role="status" aria-live="polite" aria-hidden={done}>
      <div className="loader-card">
        <div className="spinner" aria-hidden="true" />
        <span>Setting up the gym…</span>
        <div className="loader-bar" aria-hidden="true">
          <i style={{ width: `${Math.max(8, Math.round(progress))}%` }} />
        </div>
        <small>{Math.round(progress)}% loaded</small>
      </div>
    </div>
  )
}

function StillView({ reason }: { reason: 'nowebgl' | 'chosen' | 'failed' }) {
  const msg = {
    nowebgl: '3D is not available in this browser or device (WebGL is turned off or unsupported). You can still explore every booth element below.',
    failed: 'The 3D scene could not start on this device, so we switched to the image view. Every booth element is still available below.',
    chosen: 'You are viewing a still render. Switch back to 3D at any time, or open any booth element below.',
  }[reason]
  return (
    <>
      <img className="viewer-still" src={asset(site.sceneStill)} alt={`Still render of the ${site.appName} booth in the school gym.`} />
      <div className="fallback">
        <div className="fallback-card">
          <h3>{reason === 'chosen' ? 'Image view' : '3D unavailable'}</h3>
          <p>{msg}</p>
          <div className="fallback-list">
            {objectOrder.map((id) => (
              <button key={id} type="button" className="chip" onClick={() => selectObject(id, false)}>
                {boothObjects[id].kicker}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export function ExperienceSection() {
  const viewer = useRef<HTMLDivElement>(null)
  const near = useInView(viewer, '600px', true)
  const visible = useInView(viewer, '0px')
  const reduced = useReducedMotion()
  const coarse = useCoarsePointer()
  const [webgl] = useState(() => hasWebGL())
  const [help, setHelp] = useState(false)
  const [full, setFull] = useState(false)
  const canFullscreen = typeof document !== 'undefined' && !!document.fullscreenEnabled

  const mode = useStore((s) => s.mode)
  const failed = useStore((s) => s.failed)
  const selected = useStore((s) => s.selected)
  const ready = useStore((s) => s.sceneReady)
  const qualityMode = useStore((s) => s.qualityMode)
  const quality = useStore(effectiveQuality)
  const labels = useStore((s) => s.labels)
  const touchActive = useStore((s) => s.touchActive)
  const interacted = useStore((s) => s.interacted)
  const view = useStore((s) => s.view)

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === viewer.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // Escape closes the info panel / help from anywhere on the page
  useEffect(() => {
    if (!selected && !help) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (help) setHelp(false)
      else store.set({ selected: null })
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selected, help])

  const show3d = webgl && mode === '3d'
  const gateOn = show3d && coarse && !touchActive

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await viewer.current?.requestFullscreen()
    } catch {
      /* ignored: browser refused */
    }
  }

  const cycleQuality = () => {
    const next = QUALITY_ORDER[(QUALITY_ORDER.indexOf(qualityMode) + 1) % QUALITY_ORDER.length]
    store.set({ qualityMode: next, sceneReady: false })
  }

  const onViewerKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== viewer.current || !show3d) return
    const map: Record<string, () => void> = {
      ArrowLeft: () => cameraApi.rotate(-12, 0),
      ArrowRight: () => cameraApi.rotate(12, 0),
      ArrowUp: () => cameraApi.rotate(0, -6),
      ArrowDown: () => cameraApi.rotate(0, 6),
      '+': () => cameraApi.zoom(1),
      '=': () => cameraApi.zoom(1),
      '-': () => cameraApi.zoom(-1),
      Home: () => resetView(),
      '0': () => resetView(),
    }
    const fn = map[e.key]
    if (fn) {
      e.preventDefault()
      store.set({ interacted: true })
      fn()
    }
  }

  return (
    <section className="section" id="experience" aria-labelledby="xp-title">
      <div className="container">
        <div className="xp-head">
          <div className="section-head">
            <span className="eyebrow">
              <Box size={16} aria-hidden="true" /> 3D Experience
            </span>
            <h2 id="xp-title">Walk around the booth</h2>
            <p id="xp-instructions">
              Drag to orbit, scroll or pinch to zoom, and right-drag or use two fingers to pan. Select a pin or any highlighted object to see its design details. With the
              viewer focused, arrow keys orbit and +/− zoom.
            </p>
          </div>
          <div className="mode-switch" role="group" aria-label="Viewer mode">
            <button
              type="button"
              aria-pressed={show3d}
              disabled={!webgl}
              title={webgl ? undefined : '3D is not supported in this browser'}
              onClick={() => store.set({ mode: '3d', failed: false })}
            >
              <Box size={16} aria-hidden="true" /> 3D view
            </button>
            <button type="button" aria-pressed={!show3d} onClick={() => store.set({ mode: 'image', sceneReady: false })}>
              <ImageIcon size={16} aria-hidden="true" /> Image
            </button>
          </div>
        </div>

        <div
          ref={viewer}
          className={`viewer${selected ? ' has-panel' : ''}`}
          tabIndex={0}
          role="region"
          aria-label="Interactive 3D booth viewer"
          aria-describedby="xp-instructions"
          onKeyDown={onViewerKey}
        >
          {show3d ? (
            <>
              {near && (
                <SceneBoundary key={quality}>
                  <Suspense fallback={null}>
                    <Experience quality={quality} reducedMotion={reduced} visible={visible} />
                  </Suspense>
                </SceneBoundary>
              )}
              <Loader done={ready} />

              {gateOn && ready && !selected && (
                <button type="button" className="touch-gate" onClick={() => store.set({ touchActive: true, interacted: true })}>
                  <span>
                    <Hand size={20} aria-hidden="true" /> Tap to explore in 3D
                  </span>
                </button>
              )}

              <div className="vc vc-views" role="group" aria-label="Camera views">
                {VIEW_CHIPS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="chip"
                    aria-pressed={view === c.id}
                    onClick={() => {
                      store.set({ selected: null })
                      cameraApi.goTo(c.id)
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="vc vc-tools">
                {coarse && touchActive && (
                  <button type="button" className="icon-btn" onClick={() => store.set({ touchActive: false })} aria-label="Stop exploring and resume page scrolling">
                    <Check size={20} />
                  </button>
                )}
                <button type="button" className="icon-btn" aria-pressed={help} aria-expanded={help} aria-controls="viewer-help" onClick={() => setHelp((h) => !h)} aria-label="How to navigate">
                  <CircleHelp size={20} />
                </button>
                <button type="button" className="icon-btn" aria-pressed={labels} onClick={() => store.set({ labels: !labels })} aria-label={labels ? 'Hide object pins' : 'Show object pins'}>
                  <Tag size={20} />
                </button>
                <button type="button" className="icon-btn quality-btn" onClick={cycleQuality} aria-label={`Rendering quality: ${QUALITY_LABEL[qualityMode]}${qualityMode === 'auto' ? ` (${QUALITY_LABEL[quality]})` : ''}. Select to change.`}>
                  <Gauge size={18} aria-hidden="true" />
                  <span aria-hidden="true">
                    {qualityMode === 'auto' && <span className="ql-mode">Auto · </span>}
                    {QUALITY_LABEL[quality]}
                  </span>
                </button>
                {canFullscreen && (
                  <button type="button" className="icon-btn" aria-pressed={full} onClick={toggleFullscreen} aria-label={full ? 'Exit full screen' : 'Full screen'}>
                    {full ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                )}
              </div>

              {help && (
                <div className="help" id="viewer-help" role="dialog" aria-label="How to navigate the 3D booth">
                  <h3>Navigating the booth</h3>
                  <dl>
                    <dt>Orbit</dt>
                    <dd>Drag with one finger or the left mouse button</dd>
                    <dt>Zoom</dt>
                    <dd>Scroll, pinch, or use the − / + buttons</dd>
                    <dt>Pan</dt>
                    <dd>Right-drag, or drag with two fingers</dd>
                    <dt>Inspect</dt>
                    <dd>Tap a pin or a highlighted object</dd>
                    <dt>Keys</dt>
                    <dd>Arrows orbit, +/− zoom, Home resets (focus the viewer first)</dd>
                  </dl>
                </div>
              )}

              <div className="vc vc-bottom">
                <div className="vc-group">
                  <button type="button" className="icon-btn" onClick={() => cameraApi.zoom(-1)} aria-label="Zoom out">
                    <Minus size={20} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => cameraApi.zoom(1)} aria-label="Zoom in">
                    <Plus size={20} />
                  </button>
                </div>
                <button type="button" className="icon-btn" onClick={resetView} aria-label="Reset camera">
                  <RotateCcw size={20} />
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  aria-pressed={view === 'booth'}
                  onClick={() => {
                    store.set({ selected: null })
                    cameraApi.goTo('booth')
                  }}
                >
                  <Focus size={18} aria-hidden="true" /> Focus booth
                </button>
              </div>

              {ready && (
                <div className={`hint${interacted || selected ? ' hide' : ''}`} aria-hidden="true">
                  <MousePointerClick size={16} /> Drag to orbit · Scroll to zoom · Click a pin to inspect
                </div>
              )}
            </>
          ) : (
            <StillView reason={!webgl ? 'nowebgl' : failed ? 'failed' : 'chosen'} />
          )}

          {selected && <InfoPanel id={selected} onClose={() => store.set({ selected: null })} />}
        </div>
        <p className="sr-only" aria-live="polite">
          {selected ? `Showing details for ${boothObjects[selected].title}` : ''}
        </p>
      </div>
    </section>
  )
}
