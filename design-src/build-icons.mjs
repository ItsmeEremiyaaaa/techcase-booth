// Extracts a few Lucide icons (ISC license) into a plain JS map for the texture templates.
import { writeFileSync } from 'node:fs'
const names = ['flame','zap','trophy','award','book-open','calculator','flask-conical','globe','languages','house','list-checks','user','users','timer','star','qr-code','scan-line','smartphone','arrow-right','check','x','crown','target','calendar','bell','chevron-right','sparkles','medal','shield-check','brain','landmark','gamepad-2','lock','swords','layers','gift','shield','globe']
const out = {}
for (const n of names) {
  const mod = await import(new URL(`../node_modules/lucide-react/dist/esm/icons/${n}.mjs`, import.meta.url).href)
  const node = mod.__iconData.node
  out[n] = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('')
}
writeFileSync(new URL('./icons.js', import.meta.url), `window.ICONS=${JSON.stringify(out)};\nwindow.icon=(n,s=24,c='currentColor',w=2)=>'<svg xmlns="http://www.w3.org/2000/svg" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round">'+window.ICONS[n]+'</svg>';\n`)
console.log(Object.keys(out).length, 'icons')
