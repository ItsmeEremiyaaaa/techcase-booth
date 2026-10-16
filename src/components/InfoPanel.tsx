import { Award, BookOpen, ChevronLeft, ChevronRight, CircleCheck, Crown, ExternalLink, Flag, Flame, Mail, Megaphone, MessageCircle, QrCode, Smartphone, Table2, Trophy, Users, X } from 'lucide-react'
import { asset, site } from '../config/site'
import { appInfo, boothObjects, type ObjectId } from '../content/booth'
import { team, teamById, type MemberId } from '../content/team'
import { openTeam, selectMember } from '../lib/store'
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
  brochure: BookOpen,
}

const GROUP_ICONS = { book: BookOpen, flame: Flame, trophy: Trophy, award: Award, users: Users } as const

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
      <X size={20} />
    </button>
  )
}

function Slogan() {
  return (
    <p className="slogan" aria-label={appInfo.slogan.join(' ')}>
      {appInfo.slogan.map((w) => (
        <span key={w}>{w} </span>
      ))}
    </p>
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

/** "About StudyQuest": what the app does, real screenshots, and how to get it. */
export function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className="panel about-panel" aria-labelledby="panel-title">
      <div className="panel-head">
        <div className="about-title">
          <img src={asset(site.logos.studyquest)} alt="" width={48} height={48} />
          <div>
            <span className="eyebrow">About the app</span>
            <h2 id="panel-title">
              Study<span className="accent">Quest</span>
            </h2>
          </div>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <div className="panel-body">
        <img className="hero-art" src={asset('assets/brand/studyquest-fox-card.webp')} alt="The StudyQuest fox mascot waving, with +60 XP, Daily streak and Correct! badges around it." width={800} height={607} />

        <div className="quote">
          <strong>{appInfo.tagline}</strong>
          <span>{appInfo.intro}</span>
        </div>
        <Slogan />

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
        <ul className="list">
          {appInfo.access.map((a) => (
            <li key={a}>
              <CircleCheck size={16} aria-hidden="true" />
              <span>{a}</span>
            </li>
          ))}
        </ul>

        <div>
          <h3 className="h4">Quizzes for</h3>
          <div className="course-chips">
            {appInfo.courses.map((c) => (
              <span key={c}>{c}</span>
            ))}
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

        <div className="contact">
          <a href={appInfo.feedbackUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={17} aria-hidden="true" /> Send feedback
          </a>
          <a href={`mailto:${appInfo.email}`}>
            <Mail size={17} aria-hidden="true" /> {appInfo.email}
          </a>
        </div>

        <button type="button" className="btn btn-secondary btn-sm" onClick={() => openTeam()}>
          <Users size={17} aria-hidden="true" /> Meet the team behind it
        </button>

        <p className="built-with">{appInfo.builtWith}</p>
      </div>
    </aside>
  )
}

function Avatar({ id, size = 'md' }: { id: MemberId; size?: 'md' | 'lg' }) {
  const m = teamById[id]
  return (
    <span className={`avatar avatar-${size}`} style={{ background: m.color }} aria-hidden="true">
      {m.initials}
      {m.lead && (
        <i className="avatar-crown">
          <Crown size={size === 'lg' ? 16 : 12} />
        </i>
      )}
    </span>
  )
}

/** "Meet the team": the four developers, Jeremiah first. */
export function TeamPanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className="panel team-panel" aria-labelledby="panel-title">
      <div className="panel-head">
        <div>
          <span className="eyebrow">
            <Users size={15} aria-hidden="true" /> The developers
          </span>
          <h2 id="panel-title">Meet the team</h2>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <div className="panel-body">
        <p>Four BSIT 4th-year students from St. Mary’s College of Bansalan built StudyQuest. Tap anyone to read more, or click them at the booth.</p>
        <ul className="team-list">
          {team.map((m) => (
            <li key={m.id}>
              <button type="button" className={`member-card${m.lead ? ' lead' : ''}`} onClick={() => selectMember(m.id)}>
                <Avatar id={m.id} />
                <span className="member-card-text">
                  <b>{m.name}</b>
                  <span>{m.role}</span>
                  <small>{m.year}</small>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

/** One developer's profile. */
export function MemberPanel({ id, onClose }: { id: MemberId; onClose: () => void }) {
  const m = teamById[id]
  const i = team.findIndex((t) => t.id === id)
  const prev = team[(i - 1 + team.length) % team.length]
  const next = team[(i + 1) % team.length]
  return (
    <aside className="panel member-panel" aria-labelledby="panel-title" key={id}>
      <div className="panel-head">
        <button type="button" className="back-link" onClick={() => openTeam(false)}>
          <ChevronLeft size={16} aria-hidden="true" /> Team
        </button>
        <CloseButton onClose={onClose} />
      </div>
      <div className="panel-body">
        <div className="member-hero">
          <Avatar id={id} size="lg" />
          <div>
            {m.lead && (
              <span className="lead-badge">
                <Crown size={13} aria-hidden="true" /> Project Leader
              </span>
            )}
            <h2 id="panel-title">{m.name}</h2>
            <p className="member-role">{m.role}</p>
            <p className="member-year">{m.year}</p>
          </div>
        </div>
        <p>{m.bio}</p>
        <div>
          <h3 className="h4">On the team</h3>
          <ul className="list">
            {m.highlights.map((h) => (
              <li key={h}>
                <CircleCheck size={16} aria-hidden="true" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
        <blockquote className="member-quote">“{m.quote}”</blockquote>
        <div className="member-nav">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => selectMember(prev.id)} aria-label={`Previous: ${prev.name}`}>
            <ChevronLeft size={16} aria-hidden="true" /> {prev.firstName}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => selectMember(next.id)} aria-label={`Next: ${next.name}`}>
            {next.firstName} <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
