import { Award, BookOpen, CircleCheck, ExternalLink, Flag, Flame, Megaphone, QrCode, Smartphone, Table2, Trophy, Users, X } from 'lucide-react'
import { asset, site } from '../config/site'
import { appInfo, boothObjects, type ObjectId } from '../content/booth'
import { AppPreview } from './AppPreview'
import { ObjectDetails } from './ObjectDetails'
import { QrImage } from './QrImage'

export const OBJECT_ICONS: Record<ObjectId, typeof Flag> = {
  table: Table2,
  backdrop: Flag,
  banner: Megaphone,
  devices: Smartphone,
  qr: QrCode,
  students: Users,
}

const GROUP_ICONS = { book: BookOpen, flame: Flame, trophy: Trophy, award: Award, users: Users } as const

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
      <X size={20} />
    </button>
  )
}

/** Floating side panel (desktop) / bottom sheet (phones) for the selected booth object. */
export function InfoPanel({ id, onClose }: { id: ObjectId; onClose: () => void }) {
  const o = boothObjects[id]
  const Icon = OBJECT_ICONS[id]
  return (
    <aside className="panel" aria-labelledby="panel-title" key={id}>
      <div className="panel-head">
        <div>
          <span className="eyebrow">
            <Icon size={15} aria-hidden="true" /> {o.kicker}
          </span>
          <h2 id="panel-title">{o.title}</h2>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <div className="panel-body">
        <ObjectDetails id={id} />
      </div>
    </aside>
  )
}

/** "About StudyQuest": what the app does, real screenshots, and a way to open it. */
export function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className="panel about-panel" aria-labelledby="panel-title">
      <div className="panel-head">
        <div className="about-title">
          {/* PLACEHOLDER mark — replace public/assets/brand/studyquest-mark-placeholder.svg with the real app icon */}
          <img src={asset(site.logos.studyquest)} alt="" width={48} height={48} />
          <div>
            <span className="eyebrow">About the app</span>
            <h2 id="panel-title">{site.appName}</h2>
          </div>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <div className="panel-body">
        <div className="quote">
          <strong>{appInfo.tagline}</strong>
          <span>{appInfo.intro}</span>
        </div>

        <div className="qr-box">
          <QrImage size={232} />
          <div>
            <strong>{site.qrCaption}</strong>
            <a className="btn btn-primary btn-sm" href={site.qrUrl} target="_blank" rel="noreferrer">
              Play {site.appName} <ExternalLink size={16} aria-hidden="true" />
            </a>
            <p>{site.qrUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
          </div>
        </div>

        <div>
          <h3 className="h4">Inside the app</h3>
          <AppPreview />
        </div>

        {appInfo.groups.map((g) => {
          const Icon = GROUP_ICONS[g.icon]
          return (
            <div key={g.title}>
              <h3 className="h4">
                <Icon size={15} aria-hidden="true" /> {g.title}
              </h3>
              <ul className="list">
                {g.items.map((it) => (
                  <li key={it}>
                    <CircleCheck size={16} aria-hidden="true" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        <p className="built-with">{appInfo.builtWith}</p>
      </div>
    </aside>
  )
}
