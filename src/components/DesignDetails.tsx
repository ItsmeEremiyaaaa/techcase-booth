import { useState } from 'react'
import { Box, ChevronRight, Layers } from 'lucide-react'
import { asset } from '../config/site'
import { appScreens, boothObjects, type ObjectId } from '../content/booth'
import { selectObject, store, useStore } from '../lib/store'
import { OBJECT_ICONS } from './InfoPanel'
import { ObjectDetails } from './ObjectDetails'
import { AppPreview } from './AppPreview'

const CARDS: { id: ObjectId; media?: string; contain?: boolean }[] = [
  { id: 'table', media: 'assets/textures/tablefront.webp' },
  { id: 'backdrop', media: 'assets/textures/backdrop.webp' },
  { id: 'banner', media: 'assets/textures/rollup.webp', contain: true },
  { id: 'qr' },
  { id: 'students' },
]

function inspect(id: ObjectId) {
  const s = store.get()
  if (s.mode === '3d' && !s.failed) selectObject(id)
  else selectObject(id, false)
  document.getElementById('experience')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

function DesignCard({ id, media, contain }: { id: ObjectId; media?: string; contain?: boolean }) {
  const o = boothObjects[id]
  const Icon = OBJECT_ICONS[id]
  return (
    <article className="card" aria-labelledby={`card-${id}`}>
      <div className="card-icon" aria-hidden="true">
        <Icon size={24} />
      </div>
      <div>
        <div className="kicker">{o.kicker}</div>
        <h3 id={`card-${id}`}>{o.title}</h3>
      </div>
      <p>{o.summary}</p>
      {media && (
        <div className={`card-media${contain ? ' contain' : ''}`}>
          <img src={asset(media)} alt={o.imageAlt ?? `${o.title} design`} loading="lazy" />
        </div>
      )}
      <details>
        <summary>
          <ChevronRight size={16} aria-hidden="true" /> Full details
        </summary>
        <div>
          <ObjectDetails id={id} showSummary={false} showPreview={false} />
        </div>
      </details>
      <div className="card-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => inspect(id)}>
          <Box size={16} aria-hidden="true" /> Inspect in 3D
        </button>
      </div>
    </article>
  )
}

export function DesignDetails() {
  const [screen, setScreen] = useState(0)
  const mode = useStore((s) => s.mode)
  const devices = boothObjects.devices
  return (
    <section className="section" id="design" aria-labelledby="design-title" style={{ background: '#fff' }}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">
            <Layers size={16} aria-hidden="true" /> Booth design
          </span>
          <h2 id="design-title">Six pieces, one clear path to the app</h2>
          <p>Every element of the booth has one job: get a student from the aisle to playing StudyQuest in a couple of minutes. Open any card for its specs, or inspect it in 3D.</p>
        </div>

        <div className="cards">
          <article className="card feature" aria-labelledby="card-devices">
            <div>
              <div className="card-icon" aria-hidden="true">
                <OBJECT_ICONS.devices size={24} />
              </div>
              <div>
                <div className="kicker">{devices.kicker}</div>
                <h3 id="card-devices">{devices.title}</h3>
              </div>
              <p style={{ color: 'var(--muted)' }}>{devices.summary}</p>
              <div className="screens-strip" role="list" aria-label="App screens">
                {appScreens.map((s, i) => (
                  <button key={s.id} type="button" role="listitem" onClick={() => setScreen(i)} aria-label={`Show the ${s.title} screen`} aria-current={screen === i}>
                    <img src={asset(s.src)} alt="" loading="lazy" width={540} height={1170} />
                    {s.title}
                  </button>
                ))}
              </div>
              <details>
                <summary>
                  <ChevronRight size={16} aria-hidden="true" /> Full details
                </summary>
                <div>
                  <ObjectDetails id="devices" showSummary={false} showPreview={false} />
                </div>
              </details>
              <div className="card-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => inspect('devices')}>
                  <OBJECT_ICONS.devices size={16} aria-hidden="true" /> {mode === '3d' ? 'Inspect devices in 3D' : 'Open device details'}
                </button>
              </div>
            </div>
            <AppPreview key={screen} initial={screen} />
          </article>
          {CARDS.map((c) => (
            <DesignCard key={c.id} {...c} />
          ))}
        </div>
      </div>
    </section>
  )
}
