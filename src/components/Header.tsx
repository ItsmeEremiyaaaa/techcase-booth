import { useEffect, useRef, useState } from 'react'
import { Box, Menu, X } from 'lucide-react'
import { Brand } from './Logo'

const LINKS = [
  { href: '#top', label: 'Overview' },
  { href: '#experience', label: '3D Experience' },
  { href: '#design', label: 'Booth Design' },
  { href: '#materials', label: 'Materials' },
  { href: '#about', label: 'About' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btn.current?.focus()
      }
    }
    const onResize = () => window.innerWidth > 860 && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <header className="header">
      <div className="container header-inner">
        <Brand />
        <button
          ref={btn}
          type="button"
          className="icon-btn menu-btn"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav id="site-nav" className={`nav${open ? ' open' : ''}`} aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a className="btn btn-primary btn-sm" href="#experience" onClick={() => setOpen(false)}>
            <Box size={18} aria-hidden="true" />
            Explore in 3D
          </a>
        </nav>
      </div>
    </header>
  )
}
