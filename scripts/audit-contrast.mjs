/**
 * WCAG contrast audit for the colour tokens.
 *
 * The palette is derived from two numbers in src/config/client.config.ts
 * (accent chroma + hue), so this has to be re-run every time a client's accent
 * changes. That is exactly what it is for.
 *
 *   npm run audit:contrast
 *
 * Exits non-zero if any text pair falls under 4.5:1 (AA) or any non-text pair
 * falls under 3:1.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

/* ---- read the accent straight out of the client config ---- */
const cfg = readFileSync(path.join(process.cwd(), 'src/config/client.config.ts'), 'utf8')
const chroma = Number(/chroma:\s*([0-9.]+)/.exec(cfg)?.[1])
const hue = Number(/hue:\s*([0-9.]+)/.exec(cfg)?.[1])
if (!Number.isFinite(chroma) || !Number.isFinite(hue)) {
  console.error('Could not read accent { chroma, hue } from src/config/client.config.ts')
  process.exit(1)
}

/* ---- OKLCH -> sRGB ---- */
function oklchToSrgb(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  return [r, g, bl].map((v) => Math.min(1, Math.max(0, v)))
}

/** Relative luminance straight from linear-light sRGB. */
function luminance([r, g, b]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(c1, c2) {
  const a = luminance(c1)
  const b = luminance(c2)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

function hex(linear) {
  const enc = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
  return (
    '#' +
    linear
      .map((v) => Math.round(Math.min(255, Math.max(0, enc(v) * 255))))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  )
}

const AC = chroma
const AH = hue

/* Mirrors the ramp in src/app/globals.css. Keep the two in step. */
const tokens = {
  paper: [0.986, 0.004, AH],
  'paper-2': [0.962, 0.008, AH],
  'paper-3': [0.928, 0.012, AH],
  ink: [0.235, 0.018, AH],
  'ink-muted': [0.452, 0.017, AH],
  'ink-faint': [0.532, 0.016, AH],
  line: [0.878, 0.011, AH],
  'line-strong': [0.795, 0.015, AH],
  'border-control': [0.598, 0.021, AH],
  accent: [0.502, AC, AH],
  'accent-ink': [0.432, AC, AH],
  'accent-hover': [0.44, AC, AH],
  'accent-soft': [0.955, AC * 0.19, AH],
  'accent-line': [0.86, AC * 0.35, AH],
  'on-accent': [0.99, 0.004, AH],
  focus: [0.42, 0.14, 264],
}

const rgb = Object.fromEntries(
  Object.entries(tokens).map(([k, v]) => [k, oklchToSrgb(v[0], v[1], v[2])]),
)

/** [foreground, background, minimum, why] */
const pairs = [
  ['ink', 'paper', 4.5, 'body + headings on the page'],
  ['ink', 'paper-2', 4.5, 'headings on the alternate surface'],
  ['ink', 'paper-3', 4.5, 'headings on the deepest surface'],
  ['ink', 'accent-soft', 4.5, 'headings on the accent wash'],
  ['ink-muted', 'paper', 4.5, 'paragraph text'],
  ['ink-muted', 'paper-2', 4.5, 'paragraph text on the alternate surface'],
  ['ink-muted', 'paper-3', 4.5, 'paragraph text on the deepest surface'],
  ['ink-muted', 'accent-soft', 4.5, 'paragraph text on the accent wash'],
  ['ink-faint', 'paper', 4.5, 'labels, captions, step numbers'],
  ['ink-faint', 'paper-2', 4.5, 'labels on the alternate surface'],
  ['accent-ink', 'paper', 4.5, 'eyebrow labels and quiet links'],
  ['accent-ink', 'paper-2', 4.5, 'eyebrow labels on the alternate surface'],
  ['accent-ink', 'accent-soft', 4.5, 'accent text inside the accent wash'],
  ['on-accent', 'accent', 4.5, 'primary button label'],
  ['on-accent', 'accent-hover', 4.5, 'primary button label, hovered'],
  ['focus', 'paper', 3, 'focus ring against the page'],
  ['focus', 'paper-2', 3, 'focus ring on the alternate surface'],
  ['focus', 'paper-3', 3, 'focus ring on the deepest surface'],
  ['accent', 'paper', 3, 'accent fills and indicators as non-text'],
  ['border-control', 'paper', 3, 'secondary button border (WCAG 1.4.11)'],
  ['border-control', 'paper-2', 3, 'secondary button border on the alternate surface'],
]

let failures = 0
const rows = []
for (const [fg, bg, min, why] of pairs) {
  const r = ratio(rgb[fg], rgb[bg])
  const pass = r >= min
  if (!pass) failures++
  rows.push({
    pair: `${fg} on ${bg}`,
    ratio: r.toFixed(2) + ':1',
    min: min.toFixed(1) + ':1',
    result: pass ? 'PASS' : 'FAIL',
    note: why,
  })
}

console.log(`\nAccent: oklch(L ${AC} ${AH})  chroma=${AC}  hue=${AH}`)
console.log('Swatches:', Object.entries(rgb).map(([k, v]) => `${k}=${hex(v)}`).join('  '))
console.table(rows)

if (failures) {
  console.error(`\n${failures} contrast pair(s) below the minimum. Adjust the lightness steps in src/app/globals.css and in the tokens map above.`)
  process.exit(1)
}
console.log(`\nAll ${pairs.length} pairs pass.`)
