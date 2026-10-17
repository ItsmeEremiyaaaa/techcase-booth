import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, CircleHelp, Focus, Gauge, Hand, Info, Maximize, Minimize, Minus, MousePointerClick, Plus, RotateCcw, Tag, Users, X } from 'lucide-react'
import { asset, site } from '../config/site'
import { boothObjects, objectOrder } from '../content/booth'
import { hasWebGL } from '../lib/device'
import { cameraApi, closePanels, effectiveQuality, openAbout, openTeam, resetView, selectObject, store, useStore, type Quality, type QualityMode, type ViewId } from '../lib/store'
import { teamById } from '../content/team'
import { useReducedMotion } from '../hooks/useMedia'
import { AboutPanel, InfoPanel, MemberPanel, TeamPanel } from './InfoPanel'

const Experience = lazy(() => import('../three/Experience'))

const VIEW_CHIPS: { id: ViewId; label: string }[] = [
  { id: 'initial', label: 'Overview' },
  { id: 'table', label: 'Table' },
  { id: 'banner', label: 'Banner' },
  { id: 'devices', label: 'Devices' },
  { id: 'team', label: 'Team' },
  { id: 'students', label: 'Visitors' },
  { id: 'court', label: 'Full court' },
]

const QUALITY_ORDER: QualityMode[] = ['auto', 'high', 'medium', 'low']
const QUALITY_LABEL: Record<QualityMode, string> = { auto: 'Auto', high: 'High', medium: 'Medium', low: 'Low' }
const QUALITY_HELP: Record<QualityMode, string> = {
  auto: 'Picks a level for this device and steps down if it gets choppy',
  high: 'Reflective floor, sharp shadows, full crowd',
  medium: 'Softer shadows, smaller crowd',
  low: 'No shadows or crowd, the fastest',
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.error('3D scene failed, showing the still image instead.', err)
    store.set({ failed: true, mode: 'image', sceneReady: false })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Loader({ done, label }: { done: boolean; label: string }) {
  const progress = useStore((s) => s.progress)
  return (
    <div className={`loader${done ? ' done' : ''}`} role="status" aria-live="polite" aria-hidden={done}>
      <div className="loader-card">
        <img src={asset(site.logos.techcase)} alt="" width={72} height={72} />
        <strong>{site.eventName} Showcase</strong>
        <span>{label}</span>
        <div className="loader-bar" aria-hidden="true">
          <i style={{ width: `${Math.max(8, Math.round(progress))}%` }} />
        </div>
      </div>
    </div>
  )
}

function Intro({ show3d }: { show3d: boolean }) {
  return (
    <div className="intro" role="dialog" aria-labelledby="intro-title" aria-describedby="intro-text">
      <button type="button" className="icon-btn intro-close" onClick={() => store.set({ intro: false })} aria-label="Close welcome message">
        <X size={18} />
      </button>
      <span className="eyebrow">
        {site.eventName} · {site.eventTagline}
      </span>
      <h1 id="intro-title">Welcome to the {site.eventName} Showcase</h1>
      <p id="intro-text">
        {show3d
          ? `Step into the school gym and visit the ${site.appName} booth. Drag to look around, tap a pin to inspect the booth, and click the team to meet the developers.`
          : `Take a look at the ${site.appName} booth, open any part of it below, or read about the app.`}
      </p>
      <div className="intro-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            store.set({ intro: false, interacted: true })
            if (show3d) cameraApi.goTo('booth')
          }}
        >
          <Hand size={18} aria-hidden="true" /> Explore the booth
        </button>
        <button type="button" className="btn btn-secondary" onClick={openAbout}>
          <Info size={18} aria-hidden="true" /> About {site.appName}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => openTeam(show3d)}>
          <Users size={18} aria-hidden="true" /> Meet the team
        </button>
      </div>
    </div>
  )
}

function Help() {
  return (
    <div className="help" id="viewer-help" role="dialog" aria-label="How to move around">
      <h2>Moving around</h2>
      <dl>
        <dt>Look</dt>
        <dd>Drag with one finger or the left mouse button</dd>
        <dt>Zoom</dt>
        <dd>Scroll, pinch, or use − / +</dd>
        <dt>Move</dt>
        <dd>Right-drag, or drag with two fingers</dd>
        <dt>Inspect</dt>
        <dd>Tap a pin or a highlighted object</dd>
        <dt>Keys</dt>
        <dd>Arrows look around, +/− zoom, Home resets, Esc closes panels</dd>
      </dl>
    </div>
  )
}

/** Graphics quality picker. Changing the level restarts the 3D scene; the camera stays where it was. */
function QualityMenu({ mode, quality, autoQuality }: { mode: QualityMode; quality: Quality; autoQuality: Quality }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    // capture phase, so Esc closes this menu before it closes any open panel
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      setOpen(false)
      btn.current?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])
  const pick = (m: QualityMode) => {
    setOpen(false)
    if (m !== mode) store.set({ qualityMode: m, notice: null })
  }
  return (
    <div className="quality" ref={wrap}>
      <button
        ref={btn}
        type="button"
        className="icon-btn quality-btn"
        aria-expanded={open}
        aria-controls="quality-menu"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Graphics quality: ${QUALITY_LABEL[mode]}${mode === 'auto' ? ` (${QUALITY_LABEL[quality]})` : ''}`}
      >
        <Gauge size={18} aria-hidden="true" />
        <span aria-hidden="true">
          {mode === 'auto' && <span className="ql-mode">Auto · </span>}
          {QUALITY_LABEL[quality]}
        </span>
      </button>
      {open && (
        <div className="quality-menu" id="quality-menu" role="group" aria-label="Graphics quality">
          <p className="quality-title">Graphics</p>
          {QUALITY_ORDER.map((m) => (
            <button key={m} type="button" className="quality-opt" aria-pressed={m === mode} onClick={() => pick(m)}>
              <span>
                <b>
                  {QUALITY_LABEL[m]}
                  {m === 'auto' && <em> · {QUALITY_LABEL[autoQuality]} on this device</em>}
                </b>
                <small>{QUALITY_HELP[m]}</small>
              </span>
              {m === mode && <Check size={18} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** The whole site: a full-screen 3D TechCase showcase with overlay controls. */
export function Showcase() {
  const reduced = useReducedMotion()
  const [webgl] = useState(() => hasWebGL())
  const [help, setHelp] = useState(false)
  const [full, setFull] = useState(false)
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden')
  const stage = useRef<HTMLDivElement>(null)
  const canFullscreen = typeof document !== 'undefined' && !!document.fullscreenEnabled

  const mode = useStore((s) => s.mode)
  const failed = useStore((s) => s.failed)
  const selected = useStore((s) => s.selected)
  const about = useStore((s) => s.about)
  const teamOpen = useStore((s) => s.team)
  const member = useStore((s) => s.member)
  const intro = useStore((s) => s.intro)
  const ready = useStore((s) => s.sceneReady)
  const qualityMode = useStore((s) => s.qualityMode)
  const autoQuality = useStore((s) => s.autoQuality)
  const quality = useStore(effectiveQuality)
  const notice = useStore((s) => s.notice)
  const [everReady, setEverReady] = useState(false)
  const labels = useStore((s) => s.labels)
  const interacted = useStore((s) => s.interacted)
  const view = useStore((s) => s.view)

  const show3d = webgl && mode === '3d'
  const panel = about || teamOpen || !!member || !!selected

  useEffect(() => {
    if (ready) setEverReady(true)
  }, [ready])

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => store.set({ notice: null }), 6000)
    return () => window.clearTimeout(t)
  }, [notice])

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement)
    const onVis = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // keyboard: Esc closes things; arrows / +/- / Home drive the camera unless focus is in a control
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (help) setHelp(false)
        else if (store.get().selected || store.get().about || store.get().team || store.get().member) closePanels()
        else if (store.get().intro) store.set({ intro: false })
        return
      }
      if (!show3d || e.altKey || e.ctrlKey || e.metaKey) return
      const t = e.target as HTMLElement | null
      if (t && t !== document.body && t !== stage.current && t.closest('button, a, input, select, textarea, [role="tablist"], .panel')) return
      const map: Record<string, () => void> = {
        ArrowLeft: () => cameraApi.rotate(-12, 0),
        ArrowRight: () => cameraApi.rotate(12, 0),
        ArrowUp: () => cameraApi.rotate(0, -6),
        ArrowDown: () => cameraApi.rotate(0, 6),
        '+': () => cameraApi.zoom(1),
        '=': () => cameraApi.zoom(1),
        '-': () => cameraApi.zoom(-1),
        Home: () => resetView(),
      }
      const fn = map[e.key]
      if (fn) {
        e.preventDefault()
        store.set({ interacted: true, intro: false })
        fn()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [help, show3d])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      /* the browser refused */
    }
  }

  const goView = (id: ViewId) => {
    closePanels()
    store.set({ intro: false })
    cameraApi.goTo(id)
  }

  return (
    <div
      ref={stage}
      className={`stage${panel ? ' has-panel' : ''}`}
      tabIndex={-1}
      role="application"
      aria-roledescription="3D showcase"
      aria-label={`${site.eventName} Showcase in 3D, featuring the ${site.appName} booth`}
    >
      {show3d ? (
        <>
          <SceneBoundary key={quality}>
            <Suspense fallback={null}>
              <Experience quality={quality} reducedMotion={reduced} visible={visible} />
            </Suspense>
          </SceneBoundary>
          <Loader done={ready} label={everReady ? `Switching to ${QUALITY_LABEL[quality]} graphics…` : 'Setting up the gym…'} />
        </>
      ) : (
        <img className="stage-still" src={asset(site.sceneStill)} alt={`Still render of the ${site.appName} booth at the ${site.eventName} showcase in the school gym.`} />
      )}

      {/* ---------- top bar ---------- */}
      <header className="topbar">
        <div className="brand" aria-label={`${site.eventName} Showcase`}>
          <img src={asset(site.logos.techcase)} alt="" width={40} height={40} />
          <span>
            <span className="brand-name">{site.eventName} Showcase</span>
            <span className="brand-sub">Featuring {site.appName}</span>
          </span>
        </div>
        <div className="tools">
          <button
            type="button"
            className={`btn btn-sm about-btn${about ? ' on' : ''}`}
            aria-pressed={about}
            aria-label={`About ${site.appName}`}
            onClick={() => (about ? closePanels() : openAbout())}
          >
            <img src={asset(site.logos.studyquest)} alt="" width={22} height={22} />
            <span>About {site.appName}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm about-btn team-btn${teamOpen || member ? ' on' : ''}`}
            aria-pressed={teamOpen || !!member}
            aria-label="Meet the team"
            onClick={() => (teamOpen || member ? closePanels() : openTeam(show3d))}
          >
            <Users size={20} aria-hidden="true" />
            <span>Team</span>
          </button>
          <button type="button" className="icon-btn" aria-pressed={help} aria-expanded={help} aria-controls="viewer-help" onClick={() => setHelp((h) => !h)} aria-label="How to move around">
            <CircleHelp size={20} />
          </button>
          {show3d && (
            <>
              <button type="button" className="icon-btn" aria-pressed={labels} onClick={() => store.set({ labels: !labels })} aria-label={labels ? 'Hide pins' : 'Show pins'}>
                <Tag size={20} />
              </button>
              <QualityMenu mode={qualityMode} quality={quality} autoQuality={autoQuality} />
            </>
          )}
          {canFullscreen && (
            <button type="button" className="icon-btn" aria-pressed={full} onClick={toggleFullscreen} aria-label={full ? 'Exit full screen' : 'Full screen'}>
              {full ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          )}
        </div>
      </header>

      {help && <Help />}

      {notice && (
        <div className="toast" role="status">
          <Gauge size={16} aria-hidden="true" /> {notice}
        </div>
      )}

      {/* ---------- bottom bar ---------- */}
      <div className="bottombar">
        {show3d ? (
          <>
            <div className="cam-controls">
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
              <button type="button" className="btn btn-primary btn-sm" aria-pressed={view === 'booth'} onClick={() => goView('booth')}>
                <Focus size={18} aria-hidden="true" /> Focus booth
              </button>
            </div>
            <div className="views" role="group" aria-label="Camera views">
              {VIEW_CHIPS.map((c) => (
                <button key={c.id} type="button" className="chip" aria-pressed={view === c.id} onClick={() => goView(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="views" role="group" aria-label="Booth parts">
            {objectOrder.map((id) => (
              <button key={id} type="button" className="chip" aria-pressed={selected === id} onClick={() => selectObject(id, false)}>
                {boothObjects[id].kicker}
              </button>
            ))}
          </div>
        )}
      </div>

      {show3d && ready && !intro && (
        <div className={`hint${interacted || panel ? ' hide' : ''}`} aria-hidden="true">
          <MousePointerClick size={16} /> Drag to look around · Scroll to zoom · Tap a pin to inspect
        </div>
      )}

      {intro && (ready || !show3d) && !panel && <Intro show3d={show3d} />}

      {!show3d && (
        <p className="still-note" role="note">
          {webgl ? (failed ? '3D could not start on this device, so you are seeing a still image.' : 'Still image view.') : '3D is not available in this browser, so you are seeing a still image.'}
        </p>
      )}

      {about && <AboutPanel onClose={closePanels} />}
      {teamOpen && <TeamPanel onClose={closePanels} />}
      {member && <MemberPanel id={member} onClose={closePanels} />}
      {selected && <InfoPanel id={selected} onClose={closePanels} />}

      <p className="sr-only" aria-live="polite">
        {about
          ? `Showing About ${site.appName}`
          : teamOpen
            ? 'Showing the team'
            : member
              ? `Showing ${teamById[member].name}, ${teamById[member].role}`
              : selected
                ? `Showing details for ${boothObjects[selected].title}`
                : ''}
      </p>
    </div>
  )
}
