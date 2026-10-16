import { site } from '../config/site'
import { Brand } from './Logo'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand sub={site.eventTagline} />
            <p>
              An interactive 3D concept of the {site.appName} booth for the {site.eventName} showcase: booth layout, printed materials, the app demo and the visitor journey.
            </p>
          </div>
          <nav aria-label="Footer">
            <a href="#top">Overview</a>
            <a href="#experience">3D Experience</a>
            <a href="#design">Booth Design</a>
            <a href="#materials">Materials</a>
            <a href="#about">About</a>
            <a href={site.repoUrl} target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
          </nav>
        </div>
        <div className="footer-note">
          Logos and app screens shown here are placeholders, not official {site.eventName} or {site.appName} artwork. Dimensions are planning estimates.
        </div>
      </div>
    </footer>
  )
}
