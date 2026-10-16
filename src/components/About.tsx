import { Info } from 'lucide-react'
import { asset, site } from '../config/site'

export function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">
            <Info size={16} aria-hidden="true" /> About
          </span>
          <h2 id="about-title">About this project</h2>
          <p>An interactive preview of a real booth, built so the team, advisers and organizers can agree on the setup before anything is printed.</p>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <img src={asset(site.logos.techcase)} alt="" width={44} height={44} />
            <h3>{site.eventName}</h3>
            <p>The school’s campus technology showcase, where student teams present their projects to classmates, faculty and visitors.</p>
          </div>
          <div className="about-card">
            <img src={asset(site.logos.studyquest)} alt="" width={44} height={44} />
            <h3>{site.appName}</h3>
            <p>A gamified quiz app for students, built with React Native and Firebase as a BSIT capstone project by a six-person team. It features XP and levels, daily streaks, badges, leaderboards and English / Tagalog support.</p>
          </div>
          <div className="about-card">
            <img src={asset('favicon.svg')} alt="" width={44} height={44} />
            <h3>This website</h3>
            <p>A static React + Three.js site. The gym, booth and people are built from procedural 3D geometry, so it loads quickly and runs on phones without a server.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
