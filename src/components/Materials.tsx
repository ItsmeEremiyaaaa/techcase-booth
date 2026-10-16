import { CircleCheck, Hammer, Printer, Ruler, TriangleAlert } from 'lucide-react'
import { construction, materials } from '../content/booth'
import { formatDims } from '../lib/units'
import { store, useStore } from '../lib/store'

export function Materials() {
  const units = useStore((s) => s.units)
  return (
    <section className="section" id="materials" aria-labelledby="mat-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">
            <Hammer size={16} aria-hidden="true" /> Materials &amp; implementation
          </span>
          <h2 id="mat-title">What it takes to build</h2>
          <p>Suggested materials, print formats and sizes for each piece of the booth. Switch units to read sizes in feet and inches.</p>
        </div>

        <div className="mat-bar">
          <div className="notice" role="note">
            <TriangleAlert size={18} aria-hidden="true" />
            <span>
              All sizes are <strong>planning estimates</strong>. Confirm the booth slot with the TechCase organizers and the artwork sizes with your print shop. Costs are left as
              placeholders: get local quotes.
            </span>
          </div>
          <div className="mode-switch" role="group" aria-label="Measurement units">
            <button type="button" aria-pressed={units === 'metric'} onClick={() => store.set({ units: 'metric' })}>
              <Ruler size={16} aria-hidden="true" /> Metric
            </button>
            <button type="button" aria-pressed={units === 'imperial'} onClick={() => store.set({ units: 'imperial' })}>
              Imperial
            </button>
          </div>
        </div>

        <div className="table-wrap" tabIndex={0} role="region" aria-label="Materials table (scrolls sideways on small screens)">
          <table className="materials">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Suggested material</th>
                <th scope="col">Size (est.)</th>
                <th scope="col">Print format</th>
                <th scope="col">Notes</th>
                <th scope="col">Cost</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.item}>
                  <td>{m.item}</td>
                  <td>{m.material}</td>
                  <td className="size">{m.size ? formatDims(m.size, units) : m.sizeText}</td>
                  <td>{m.print}</td>
                  <td>{m.notes}</td>
                  <td className="placeholder">[Get quote]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="impl-grid">
          <div className="panelish">
            <h3>
              <Hammer size={18} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 8, color: 'var(--blue)' }} />
              Construction &amp; setup
            </h3>
            <ul className="list">
              {construction.map((c) => (
                <li key={c}>
                  <CircleCheck size={16} aria-hidden="true" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="panelish">
            <h3>
              <Printer size={18} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 8, color: 'var(--blue)' }} />
              Print checklist
            </h3>
            <ul className="list">
              {[
                'Export artwork at full size in CMYK with the bleed your printer asks for.',
                'Keep text at least 5 cm from banner edges and above the table line on the backdrop.',
                'Outline or embed fonts, and swap the placeholder logos for the official files.',
                'Print a small proof of each QR code and test it before the full run.',
              ].map((c) => (
                <li key={c}>
                  <CircleCheck size={16} aria-hidden="true" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
