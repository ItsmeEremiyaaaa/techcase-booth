import { CircleCheck } from 'lucide-react'
import { asset, site } from '../config/site'
import { boothObjects, type ObjectId, type Spec } from '../content/booth'
import { formatDims } from '../lib/units'
import { useStore } from '../lib/store'
import { AppPreview } from './AppPreview'
import { QrImage } from './QrImage'

function Specs({ specs }: { specs: Spec[] }) {
  const units = useStore((s) => s.units)
  return (
    <dl className="specs">
      {specs.map((s) => (
        <div key={s.label}>
          <dt>{s.label}</dt>
          <dd>
            {s.value ? formatDims(s.value, units) : s.text}
            {s.estimate && <span className="est" title="Planning estimate — confirm before ordering">est.</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list">
      {items.map((i) => (
        <li key={i}>
          <CircleCheck size={16} aria-hidden="true" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  )
}

/** Full details for one booth object — used by the 3D info panel and the non-3D design cards. */
export function ObjectDetails({ id, showSummary = true, showPreview = true }: { id: ObjectId; showSummary?: boolean; showPreview?: boolean }) {
  const o = boothObjects[id]
  return (
    <>
      {showSummary && <p>{o.summary}</p>}

      {id === 'devices' && showPreview && (
        <div>
          <h4>App preview</h4>
          <AppPreview />
        </div>
      )}

      {o.image && showPreview && (
        <div>
          <h4>Design preview</h4>
          <a href={asset(o.image)} target="_blank" rel="noreferrer" aria-label={`Open the full-size ${o.title} design in a new tab`}>
            <img className={`preview-img${id === 'banner' ? ' tall' : ''}`} src={asset(o.image)} alt={o.imageAlt ?? ''} loading="lazy" />
          </a>
        </div>
      )}

      {o.headline && (
        <div className="quote">
          <strong>{o.headline}</strong>
          {o.tagline && <span>{o.tagline}</span>}
        </div>
      )}

      {o.messages && (
        <div>
          <h4>Key messages</h4>
          <List items={o.messages} />
        </div>
      )}

      {o.purpose && (
        <div>
          <h4>Purpose</h4>
          <p>{o.purpose}</p>
        </div>
      )}

      {id === 'qr' && (
        <div className="qr-box">
          <QrImage size={232} />
          <p>
            <strong>{site.qrCaption}</strong>
            {site.qrUrl}
          </p>
        </div>
      )}

      {o.steps && (
        <div>
          <h4>Visitor journey</h4>
          <ol className="steps">
            {o.steps.map((s) => (
              <li key={s.title}>
                <div>
                  <strong>{s.title}</strong>
                  <span>{s.body}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div>
        <h4>{id === 'table' ? 'Dimensions' : 'Details'}</h4>
        <Specs specs={o.specs} />
      </div>

      {o.printFormat && (
        <div>
          <h4>Recommended print format</h4>
          <List items={o.printFormat} />
        </div>
      )}

      {o.materials && (
        <div>
          <h4>Proposed materials</h4>
          <List items={o.materials} />
        </div>
      )}

      {o.notes && (
        <div>
          <h4>{id === 'table' ? 'Setup notes' : 'Notes'}</h4>
          <List items={o.notes} />
        </div>
      )}
    </>
  )
}
