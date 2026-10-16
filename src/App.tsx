import { About } from './components/About'
import { DesignDetails } from './components/DesignDetails'
import { ExperienceSection } from './components/ExperienceSection'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Materials } from './components/Materials'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#experience">
        Skip to the 3D booth
      </a>
      <Header />
      <main>
        <Hero />
        <ExperienceSection />
        <DesignDetails />
        <Materials />
        <About />
      </main>
      <Footer />
    </>
  )
}
