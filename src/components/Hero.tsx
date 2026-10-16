import { Box, ChevronRight, Hand, MonitorSmartphone, Sparkles } from 'lucide-react'
import { asset, site } from '../config/site'
import { cameraApi, store } from '../lib/store'

export function Hero() {
  const explore = () => {
    store.set({ selected: null })
    cameraApi.goTo('booth')
  }
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow reveal">
            <Sparkles size={16} aria-hidden="true" />
            {site.eventName} · {site.eventTagline}
          </span>
          <h1 id="hero-title" className="reveal d1">
            Experience <em>{site.eventName}</em> in 3D.
          </h1>
          <p className="hero-lede reveal d2">
            Walk around the {site.appName} booth inside the school gym before it is built. Inspect the table and banners, preview the app on the demo devices,
            and see how students will discover, scan and play.
          </p>
          <div className="hero-actions reveal d3">
            <a className="btn btn-primary" href="#experience" onClick={explore}>
              <Box size={20} aria-hidden="true" />
              Explore the Booth
            </a>
            <a className="btn btn-secondary" href="#design">
              View Design Details
              <ChevronRight size={18} aria-hidden="true" />
            </a>
          </div>
          <ul className="hero-facts reveal d3">
            <li>
              <Box size={18} aria-hidden="true" /> Real-time 3D court
            </li>
            <li>
              <Hand size={18} aria-hidden="true" /> Click any glowing object
            </li>
            <li>
              <MonitorSmartphone size={18} aria-hidden="true" /> Phones, tablets &amp; laptops
            </li>
          </ul>
        </div>
        <div className="hero-visual reveal d2">
          <img
            src={asset(site.sceneStill)}
            alt={`3D render of the ${site.appName} booth on a school basketball court, with a blue backdrop, roll-up banner, demo table, and students at the booth.`}
            width={1600}
            height={1100}
            fetchPriority="high"
          />
          <span className="hero-chip a">
            <span>
              <Box size={16} aria-hidden="true" />
            </span>
            Live 3D below
          </span>
          <span className="hero-chip b">Featuring {site.appName}</span>
        </div>
      </div>
    </section>
  )
}
