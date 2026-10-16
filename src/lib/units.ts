export type Units = 'metric' | 'imperial'

function ftIn(m: number) {
  const totalIn = m * 39.3701
  let ft = Math.floor(totalIn / 12)
  let inch = Math.round(totalIn - ft * 12)
  if (inch === 12) {
    ft += 1
    inch = 0
  }
  return ft > 0 ? `${ft}′ ${inch}″` : `${inch}″`
}

export function formatDims(values: number[], units: Units) {
  if (units === 'metric') return values.map((v) => (v < 1 ? `${Math.round(v * 100)} cm` : `${v.toFixed(2).replace(/\.?0+$/, '')} m`)).join(' × ')
  return values.map(ftIn).join(' × ')
}
