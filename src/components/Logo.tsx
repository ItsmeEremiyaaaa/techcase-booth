import { asset, site } from '../config/site'

export function Brand({ href = '#top', sub = '3D Booth' }: { href?: string; sub?: string }) {
  return (
    <a className="brand" href={href} aria-label={`${site.eventName} home`}>
      {/* PLACEHOLDER mark — replace public/assets/brand/techcase-mark-placeholder.svg with the official logo */}
      <img src={asset(site.logos.techcase)} alt="" width={38} height={38} />
      <span>
        <span className="brand-name">{site.eventName}</span>
        <span className="brand-sub">{sub}</span>
      </span>
    </a>
  )
}
