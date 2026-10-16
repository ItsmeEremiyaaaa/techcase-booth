import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { asset } from '../config/site'
import { appScreens, tabletScreen } from '../content/booth'

const SCREENS = [...appScreens.map((s) => ({ ...s, tablet: false })), { id: 'tablet', ...tabletScreen, tablet: true }]

/** Browsable StudyQuest screenshots. */
export function AppPreview({ initial = 0 }: { initial?: number }) {
  const [i, setI] = useState(initial)
  const startX = useRef<number | null>(null)
  const n = SCREENS.length
  const go = (d: number) => setI((v) => (v + d + n) % n)
  const s = SCREENS[i]

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }
  const down = (e: PointerEvent) => (startX.current = e.clientX)
  const up = (e: PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  }

  return (
    <div className="app-preview" role="group" aria-roledescription="carousel" aria-label="StudyQuest app screens">
      <div className="app-tabs" role="tablist" aria-label="Choose a screen" onKeyDown={onKey}>
        {SCREENS.map((sc, k) => (
          <button key={sc.id} type="button" role="tab" aria-selected={k === i} tabIndex={k === i ? 0 : -1} onClick={() => setI(k)}>
            {sc.title}
          </button>
        ))}
      </div>
      <div className="app-stage" onPointerDown={down} onPointerUp={up} onPointerCancel={() => (startX.current = null)}>
        <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous screen">
          <ChevronLeft size={20} />
        </button>
        <div className={`device${s.tablet ? ' tablet' : ''}`}>
          <img src={asset(s.src)} alt={`StudyQuest ${s.title} screen: ${s.caption}`} width={s.tablet ? 768 : 374} height={s.tablet ? 1024 : 810} draggable={false} />
        </div>
        <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next screen">
          <ChevronRight size={20} />
        </button>
      </div>
      <p className="app-caption" aria-live="polite">
        <strong>
          {s.title} · {i + 1}/{n}
        </strong>
        <br />
        {s.caption}
      </p>
    </div>
  )
}
