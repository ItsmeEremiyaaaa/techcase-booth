import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { site } from '../config/site'

/** QR code for site.qrUrl, generated in the browser (no external service). */
export function QrImage({ size = 232, className }: { size?: number; className?: string }) {
  const [src, setSrc] = useState<string>('')
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(site.qrUrl, { width: size, margin: 1, color: { dark: '#0B1B4D', light: '#FFFFFF' }, errorCorrectionLevel: 'M' })
      .then((url) => alive && setSrc(url))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [size])
  if (!src) return <div className={className} style={{ width: size / 2, height: size / 2 }} aria-hidden="true" />
  return <img className={className} src={src} width={size / 2} height={size / 2} alt={`QR code linking to ${site.qrUrl}`} />
}
