import { Flag, Megaphone, QrCode, Smartphone, Table2, Users, X } from 'lucide-react'
import { boothObjects, type ObjectId } from '../content/booth'
import { ObjectDetails } from './ObjectDetails'

export const OBJECT_ICONS: Record<ObjectId, typeof Flag> = {
  table: Table2,
  backdrop: Flag,
  banner: Megaphone,
  devices: Smartphone,
  qr: QrCode,
  students: Users,
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
          <h3 id="panel-title">{o.title}</h3>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>
      </div>
      <div className="panel-body">
        <ObjectDetails id={id} />
      </div>
    </aside>
  )
}
