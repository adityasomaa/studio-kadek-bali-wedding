/**
 * Deterministic generative SVG placeholders.
 *
 *   npm run graphics
 *
 * Why generated and not stock: this is a wedding site, and reusing somebody
 * else's wedding photography is a real problem in this industry. Nothing here
 * imitates a photograph, a venue, or a face. Every file is a geometric
 * composition built from the client's own accent colour, so re-running this
 * after editing src/config/client.config.ts re-skins the whole gallery.
 *
 * No grain, no noise, no speckle filters anywhere. Depth comes from gradients,
 * line weight, scale contrast, and negative space.
 *
 * Each of the four event categories gets its own construction rule, and each
 * of the six variants inside a category is a different layout rather than the
 * same layout jittered. They have to be tellable apart at thumbnail size.
 *
 * Output is byte-stable: same config in, same bytes out.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { readClient, buildPalette } from './lib/palette.mjs'

const cwd = process.cwd()
const cfg = readClient(cwd)
const P = buildPalette(cfg.accent)
const OUT = path.join(cwd, 'public', 'graphics')

const W = 800
const H = 1000
const n = (v) => Math.round(v * 10) / 10

/* -------------------------------------------------------------------------
 * primitives
 * -----------------------------------------------------------------------*/
const doc = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
${defs}
  </defs>
${body}
</svg>
`

const linear = (id, from, to, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return `    <linearGradient id="${id}" x1="${n(50 - 50 * Math.cos(rad))}%" y1="${n(50 - 50 * Math.sin(rad))}%" x2="${n(50 + 50 * Math.cos(rad))}%" y2="${n(50 + 50 * Math.sin(rad))}%">
      <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
    </linearGradient>`
}

const radial = (id, from, to) =>
  `    <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
    </radialGradient>`

const circle = (cx, cy, r, fill = 'none', stroke = 'none', sw = 1) =>
  `    <circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`

const rect = (x, y, w, h, fill = 'none', stroke = 'none', sw = 1, rx = 0) =>
  `    <rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`

const line = (x1, y1, x2, y2, stroke, sw = 1) =>
  `    <line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${sw}"/>`

const pathEl = (d, fill = 'none', stroke = 'none', sw = 1, cap = 'butt') =>
  `    <path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="${cap}"/>`

/** Arc of a circle. t goes 0..1 clockwise from the given start angle in turns. */
const arc = (cx, cy, r, startTurn, sweepTurn, stroke, sw, cap = 'butt') => {
  const a0 = startTurn * Math.PI * 2
  const a1 = (startTurn + sweepTurn) * Math.PI * 2
  const large = Math.abs(sweepTurn) > 0.5 ? 1 : 0
  const x0 = n(cx + Math.cos(a0) * r)
  const y0 = n(cy + Math.sin(a0) * r)
  const x1 = n(cx + Math.cos(a1) * r)
  const y1 = n(cy + Math.sin(a1) * r)
  return pathEl(`M ${x0} ${y0} A ${n(r)} ${n(r)} 0 ${large} ${sweepTurn > 0 ? 1 : 0} ${x1} ${y1}`, 'none', stroke, sw, cap)
}

/** Pie wedge, used sparingly as the one solid mass in a composition. */
const wedge = (cx, cy, r, startTurn, sweepTurn, fill) => {
  const a0 = startTurn * Math.PI * 2
  const a1 = (startTurn + sweepTurn) * Math.PI * 2
  const large = sweepTurn > 0.5 ? 1 : 0
  return pathEl(
    `M ${n(cx)} ${n(cy)} L ${n(cx + Math.cos(a0) * r)} ${n(cy + Math.sin(a0) * r)} A ${n(r)} ${n(r)} 0 ${large} 1 ${n(cx + Math.cos(a1) * r)} ${n(cy + Math.sin(a1) * r)} Z`,
    fill,
  )
}

const frame = () => rect(28.5, 28.5, W - 57, H - 57, 'none', P.line, 1)

const clipFrame = (id) =>
  `    <clipPath id="${id}"><rect x="29" y="29" width="${W - 58}" height="${H - 58}"/></clipPath>`

/* =========================================================================
 * 1. INTIMATE — one circle family, held small inside a large empty field.
 *    Six genuinely different arrangements of the same vocabulary.
 * =======================================================================*/
function intimate(i) {
  const id = `i${i}`
  const defs = [
    linear(`${id}bg`, P.paper, P.paper2, 160),
    radial(`${id}soft`, P.accentSoft, P.paper),
    linear(`${id}mass`, P.accentSoft, P.accentLine, 135),
    clipFrame(`${id}clip`),
  ].join('\n')

  const layouts = [
    // 1 — a large disc pushed off the top-right corner, cropped by the frame
    () => [
      circle(660, 250, 300, `url(#${id}mass)`),
      circle(660, 250, 300, 'none', P.accent, 2),
      circle(660, 250, 224, 'none', P.accentMid, 1),
      circle(660, 250, 148, 'none', P.accentMid, 1),
      line(80, 700, W - 80, 700, P.lineStrong, 1),
      circle(200, 700, 13, P.accent),
    ],
    // 2 — two overlapping rings, the overlap is the only mass
    () => {
      const cy = 520
      const d = 130
      return [
        pathEl(
          `M 400 ${cy - 205} A 210 210 0 0 1 400 ${cy + 205} A 210 210 0 0 1 400 ${cy - 205} Z`,
          'none',
        ),
        circle(400 - d, cy, 210, 'none', P.accent, 2),
        circle(400 + d, cy, 210, 'none', P.accent, 2),
        pathEl(
          `M 400 ${n(cy - Math.sqrt(210 * 210 - d * d))} A 210 210 0 0 1 400 ${n(cy + Math.sqrt(210 * 210 - d * d))} A 210 210 0 0 1 400 ${n(cy - Math.sqrt(210 * 210 - d * d))} Z`,
          `url(#${id}soft)`,
        ),
        line(400, 130, 400, 250, P.lineStrong, 1),
        line(400, 790, 400, 900, P.lineStrong, 1),
      ]
    },
    // 3 — small centred disc, rings running past the frame edge
    () => [
      circle(400, 500, 470, 'none', P.accentLine, 1),
      circle(400, 500, 380, 'none', P.accentLine, 1),
      circle(400, 500, 290, 'none', P.accentMid, 1),
      circle(400, 500, 200, 'none', P.accent, 2),
      circle(400, 500, 96, `url(#${id}mass)`),
      circle(400, 30, 10, P.accent),
    ],
    // 4 — disc anchored bottom-left, tall accent bar on the right
    () => [
      circle(210, 800, 250, `url(#${id}soft)`),
      circle(210, 800, 250, 'none', P.accent, 2),
      arc(210, 800, 320, 0.62, 0.26, P.accentMid, 1),
      rect(620, 150, 54, 480, `url(#${id}mass)`),
      rect(620, 150, 54, 480, 'none', P.accent, 1),
      line(80, 150, 560, 150, P.lineStrong, 1),
    ],
    // 5 — three discs stepping down a diagonal
    () => [
      line(150, 250, 650, 780, P.line, 1),
      circle(230, 330, 145, `url(#${id}soft)`, P.accent, 2),
      circle(400, 510, 100, 'none', P.accentMid, 1.5),
      circle(560, 680, 62, P.accent),
      circle(650, 780, 16, 'none', P.accentMid, 1.5),
    ],
    // 6 — one ring with a single filled quadrant
    () => [
      circle(400, 500, 262, 'none', P.accent, 2),
      wedge(400, 500, 262, 0.75, 0.25, `url(#${id}mass)`),
      circle(400, 500, 178, 'none', P.accentMid, 1),
      circle(400, 500, 94, 'none', P.accentLine, 1),
      line(80, 500, 138, 500, P.accent, 2),
      line(662, 500, 720, 500, P.accent, 2),
    ],
  ]

  const body = `  <rect width="${W}" height="${H}" fill="url(#${id}bg)"/>
  <g clip-path="url(#${id}clip)">
${layouts[(i - 1) % layouts.length]().join('\n')}
  </g>
${frame()}`
  return doc(W, H, defs, body)
}

/* =========================================================================
 * 2. BEACH — a horizon line, a disc, and a rhythm of horizontal rules.
 *    The horizon height is the main variable, so the six read as a series.
 * =======================================================================*/
function beach(i) {
  const id = `b${i}`
  const specs = [
    { hz: 430, dx: 540, dr: 150, above: true, bands: 9, block: false },
    { hz: 520, dx: 250, dr: 108, above: true, bands: 12, block: true },
    { hz: 350, dx: 400, dr: 190, above: true, bands: 14, block: false },
    { hz: 600, dx: 620, dr: 130, above: false, bands: 7, block: true },
    { hz: 470, dx: 180, dr: 220, above: true, bands: 11, block: false },
    { hz: 560, dx: 400, dr: 96, above: false, bands: 16, block: false },
  ]
  const s = specs[(i - 1) % specs.length]
  const defs = [
    linear(`${id}sky`, P.accentSoft, P.paper, 180),
    linear(`${id}sea`, P.paper2, P.paper3, 180),
    linear(`${id}disc`, P.accentLine, P.accentSoft, 160),
    clipFrame(`${id}clip`),
    `    <clipPath id="${id}sky-c"><rect x="29" y="29" width="${W - 58}" height="${s.hz - 29}"/></clipPath>`,
    `    <clipPath id="${id}sea-c"><rect x="29" y="${s.hz}" width="${W - 58}" height="${H - 29 - s.hz}"/></clipPath>`,
  ].join('\n')

  const dy = s.above ? s.hz - s.dr * 0.55 : s.hz + s.dr * 0.5
  const bands = []
  for (let k = 0; k < s.bands; k++) {
    const t = k / (s.bands - 1)
    const y = s.hz + 34 + t * (H - 90 - s.hz - 34)
    const inset = 70 + 190 * (1 - t) * (k % 2 ? 0.45 : 1)
    const strong = k === Math.floor(s.bands * 0.62)
    bands.push(line(inset, y, W - 70 - 120 * t * (k % 3 === 0 ? 1 : 0.2), y, strong ? P.accent : P.accentMid, strong ? 2.5 : 1))
  }

  const block = s.block ? [rect(70, s.hz - 190, 40, 190, P.accent)] : []

  const body = `  <rect width="${W}" height="${H}" fill="url(#${id}sky)"/>
  <g clip-path="url(#${id}sea-c)">
${rect(0, s.hz, W, H - s.hz, `url(#${id}sea)`)}
  </g>
  <g clip-path="url(#${id}clip)">
${circle(s.dx, dy, s.dr, `url(#${id}disc)`)}
${circle(s.dx, dy, s.dr, 'none', P.accent, 2)}
${block.join('\n')}
${line(29, s.hz, W - 29, s.hz, P.ink, 1.5)}
${bands.join('\n')}
  </g>
${frame()}`
  return doc(W, H, defs, body)
}

/* =========================================================================
 * 3. TRADITIONAL — strict mirror symmetry about a single vertical axis.
 *    Stacked, tiered, gate-like. Symmetry is what sets these apart at a
 *    glance from the other three families.
 * =======================================================================*/
function traditional(i) {
  const id = `t${i}`
  const cx = W / 2
  const defs = [
    linear(`${id}bg`, P.paper2, P.paper, 180),
    linear(`${id}mass`, P.accentSoft, P.accentLine, 180),
    clipFrame(`${id}clip`),
  ].join('\n')

  const axis = line(cx, 60, cx, H - 60, P.line, 1)
  const ground = (y) => line(80, y, W - 80, y, P.ink, 1.5)

  const layouts = [
    // 1 — five-tier stack
    () => {
      const out = []
      let y = 800
      let w = 460
      for (let k = 0; k < 5; k++) {
        out.push(rect(cx - w / 2, y - 66, w, 66, k % 2 ? `url(#${id}mass)` : P.paper, P.accent, 1.5))
        y -= 78
        w *= 0.78
      }
      out.push(circle(cx, y + 6, 15, P.accent))
      out.push(ground(800))
      return out
    },
    // 2 — a gate: two columns and a lintel
    () => [
      rect(cx - 230, 300, 74, 500, `url(#${id}mass)`, P.accent, 1.5),
      rect(cx + 156, 300, 74, 500, `url(#${id}mass)`, P.accent, 1.5),
      rect(cx - 270, 232, 540, 56, P.paper, P.accent, 1.5),
      arc(cx, 300, 156, 0.5, 0.5, P.accentMid, 1.5),
      circle(cx, 170, 16, P.accent),
      ground(800),
    ],
    // 3 — nested squares on the axis
    () => {
      const out = []
      for (let k = 0; k < 5; k++) {
        const s = 420 - k * 78
        out.push(rect(cx - s / 2, 500 - s / 2, s, s, k === 4 ? P.accent : 'none', k % 2 ? P.accentMid : P.accent, k % 2 ? 1 : 2))
      }
      out.push(line(cx - 300, 500, cx - 230, 500, P.accent, 2))
      out.push(line(cx + 230, 500, cx + 300, 500, P.accent, 2))
      return out
    },
    // 4 — a colonnade of seven bars, tallest at the centre
    () => {
      const out = []
      for (let k = -3; k <= 3; k++) {
        const h = 480 - Math.abs(k) * 92
        out.push(rect(cx + k * 96 - 26, 800 - h, 52, h, Math.abs(k) === 0 ? `url(#${id}mass)` : P.paper, P.accent, 1.5))
      }
      out.push(ground(800))
      out.push(circle(cx, 250, 13, P.accent))
      return out
    },
    // 5 — stacked chevrons
    () => {
      const out = []
      for (let k = 0; k < 6; k++) {
        const y = 760 - k * 92
        const w = 380 - k * 34
        out.push(pathEl(`M ${n(cx - w / 2)} ${y} L ${cx} ${n(y - 86)} L ${n(cx + w / 2)} ${y}`, 'none', k % 2 ? P.accentMid : P.accent, k % 2 ? 1 : 2.5))
      }
      out.push(ground(800))
      return out
    },
    // 6 — a tall arch pierced by a disc
    () => [
      pathEl(`M ${cx - 210} 800 L ${cx - 210} 430 A 210 210 0 0 1 ${cx + 210} 430 L ${cx + 210} 800 Z`, `url(#${id}mass)`, P.accent, 2),
      circle(cx, 470, 108, P.paper, P.accent, 2),
      circle(cx, 470, 52, P.accent),
      rect(cx - 270, 800, 540, 42, P.paper, P.accent, 1.5),
      ground(800),
    ],
  ]

  const body = `  <rect width="${W}" height="${H}" fill="url(#${id}bg)"/>
  <g clip-path="url(#${id}clip)">
${axis}
${layouts[(i - 1) % layouts.length]().join('\n')}
  </g>
${frame()}`
  return doc(W, H, defs, body)
}

/* =========================================================================
 * 4. RECEPTION — a plan view. Rounds arranged in relation to one long bar.
 * =======================================================================*/
function reception(i) {
  const id = `r${i}`
  const defs = [
    linear(`${id}bg`, P.paper, P.paper2, 300),
    linear(`${id}bar`, P.accentLine, P.accentSoft, 90),
    clipFrame(`${id}clip`),
  ].join('\n')

  const round = (x, y, r, filled) =>
    circle(x, y, r, filled ? P.accentSoft : 'none', filled ? P.accent : P.accentMid, filled ? 2 : 1)

  const layouts = [
    // 1 — a grid of rounds under a stage bar
    () => {
      const out = [rect(230, 170, 340, 46, `url(#${id}bar)`, P.accent, 1.5, 23)]
      for (let r0 = 0; r0 < 4; r0++)
        for (let c = 0; c < 4; c++)
          out.push(round(160 + c * 160, 380 + r0 * 155, 46, r0 === 1 && c === 2))
      out.push(line(400, 216, 400, 900, P.line, 1))
      return out
    },
    // 2 — rounds on a ring around one centre
    () => {
      const out = [circle(400, 520, 250, 'none', P.line, 1)]
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2 - Math.PI / 2
        out.push(round(400 + Math.cos(a) * 250, 520 + Math.sin(a) * 250, 52, k === 0))
      }
      out.push(circle(400, 520, 84, `url(#${id}bar)`, P.accent, 2))
      out.push(rect(230, 880, 340, 44, P.accent, 'none', 0, 22))
      return out
    },
    // 3 — a horseshoe opening toward the bar
    () => {
      const out = [rect(180, 800, 440, 46, `url(#${id}bar)`, P.accent, 1.5, 23)]
      for (let k = 0; k < 11; k++) {
        const t = k / 10
        const a = Math.PI * (0.08 + t * 0.84)
        out.push(round(400 - Math.cos(a) * 270, 500 - Math.sin(a) * 270 + 120, 44, k === 5))
      }
      out.push(arc(400, 620, 270, 0.54, 0.42, P.line, 1))
      return out
    },
    // 4 — two blocks either side of a central aisle
    () => {
      const out = [rect(300, 150, 200, 46, P.accent, 'none', 0, 23)]
      for (let r0 = 0; r0 < 5; r0++)
        for (const side of [-1, 1])
          for (let c = 0; c < 2; c++) {
            const x = 400 + side * (110 + c * 130)
            out.push(round(x, 340 + r0 * 130, 40, r0 === 0 && side === 1 && c === 0))
          }
      out.push(line(400, 220, 400, 920, P.accent, 2))
      return out
    },
    // 5 — staggered rows, loose and open
    () => {
      const out = [rect(120, 190, 560, 40, `url(#${id}bar)`, P.accent, 1.5, 20)]
      for (let r0 = 0; r0 < 5; r0++) {
        const cols = r0 % 2 ? 3 : 4
        for (let c = 0; c < cols; c++) {
          const x = 400 + (c - (cols - 1) / 2) * 170
          out.push(round(x, 380 + r0 * 138, 50, r0 === 2 && c === 1))
        }
      }
      return out
    },
    // 6 — one large round dominating, satellites around it
    () => {
      const out = [
        circle(400, 560, 190, `url(#${id}bar)`, P.accent, 2),
        circle(400, 560, 110, 'none', P.accentMid, 1),
      ]
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + 0.3
        out.push(round(400 + Math.cos(a) * 320, 560 + Math.sin(a) * 320, 44, false))
      }
      out.push(rect(250, 130, 300, 44, P.accent, 'none', 0, 22))
      return out
    },
  ]

  const body = `  <rect width="${W}" height="${H}" fill="url(#${id}bg)"/>
  <g clip-path="url(#${id}clip)">
${layouts[(i - 1) % layouts.length]().join('\n')}
  </g>
${frame()}`
  return doc(W, H, defs, body)
}

/* =========================================================================
 * Hero — the one composition that has to hold a full screen height.
 * =======================================================================*/
function hero() {
  const HW = 900
  const HH = 1200
  const cx = 450
  const cy = 620
  const defs = [
    linear('hbg', P.paper, P.accentSoft, 155),
    linear('hmass', P.accentSoft, P.accentLine, 135),
    `    <clipPath id="hclip"><rect x="0" y="0" width="${HW}" height="${HH}"/></clipPath>`,
  ].join('\n')

  const rings = [430, 330, 230]
    .map((r, k) => circle(cx, cy, r, 'none', k === 0 ? P.accent : P.accentMid, k === 0 ? 2 : 1))
    .join('\n')

  const body = `  <rect width="${HW}" height="${HH}" fill="url(#hbg)"/>
  <g clip-path="url(#hclip)">
${wedge(cx, cy, 430, 0.75, 0.25, `url(#hmass)`)}
${rings}
${circle(cx, cy, 130, P.paper, P.accent, 2)}
${circle(cx, cy, 44, P.accent)}
${pathEl(`M 0 ${cy + 430} Q ${cx} ${cy - 470} ${HW} ${cy + 260}`, 'none', P.accent, 2)}
${pathEl(`M 0 ${cy + 250} Q ${cx} ${cy - 330} ${HW} ${cy + 430}`, 'none', P.accentMid, 1)}
${line(0, cy, HW, cy, P.line, 1)}
${circle(cx, cy - 430, 12, P.accent)}
  </g>`
  return doc(HW, HH, defs, body)
}

/* =========================================================================
 * Package marks — three arcs read as "how much of the work is covered".
 * =======================================================================*/
function packageMark(key, covered) {
  const PW = 600
  const PH = 300
  const cx = PW / 2
  const cy = PH - 44
  const radii = [212, 162, 112]
  const defs = linear(`pm${key}`, P.paper, P.paper2, 180)
  const track = radii.map((r) => arc(cx, cy, r, 0.5, 0.5, P.line, 1)).join('\n')
  const filled = radii
    .map((r, k) => (covered[k] > 0 ? arc(cx, cy, r, 0.5, 0.5 * covered[k], k === 0 ? P.accent : P.accentMid, 5, 'round') : ''))
    .filter(Boolean)
    .join('\n')
  const body = `  <rect width="${PW}" height="${PH}" fill="url(#pm${key})"/>
  <g>
${track}
${filled}
${circle(cx, cy, 6, P.ink)}
  </g>`
  return doc(PW, PH, defs, body)
}

/* =========================================================================
 * Site icon — transparent, no plate, legible at 32px.
 * Two arcs meeting on one axis. It also appears as the site's quiet motif.
 * =======================================================================*/
function siteIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <title>${cfg.name}</title>
  <g fill="none" stroke="${P.accent}" stroke-width="6" stroke-linecap="round">
    <path d="M 24 10 A 22 22 0 0 0 24 54"/>
    <path d="M 40 10 A 22 22 0 0 1 40 54"/>
  </g>
  <circle cx="32" cy="32" r="6" fill="${P.accentInk}"/>
</svg>
`
}

/* -------------------------------------------------------------------------
 * run
 * -----------------------------------------------------------------------*/
const builders = { intimate, beach, traditional, reception }
const COUNT = 6

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

let written = 0
for (const [key, fn] of Object.entries(builders)) {
  for (let i = 1; i <= COUNT; i++) {
    await writeFile(path.join(OUT, `${key}-${i}.svg`), fn(i), 'utf8')
    written++
  }
}

await writeFile(path.join(OUT, 'hero.svg'), hero(), 'utf8')
written++

const coverage = { full: [1, 1, 1], partial: [1, 0.6, 0], 'day-coordinator': [0.32, 0, 0] }
for (const [key, cov] of Object.entries(coverage)) {
  await writeFile(path.join(OUT, `package-${key}.svg`), packageMark(key, cov), 'utf8')
  written++
}

await writeFile(path.join(cwd, 'public', 'icon.svg'), siteIcon(), 'utf8')
written++

console.log(`${written} SVG files generated for "${cfg.name}" (accent hue ${cfg.accent.hue}, chroma ${cfg.accent.chroma}).`)
console.log(`  gallery : ${Object.keys(builders).length} categories x ${COUNT} distinct layouts`)
console.log(`  other   : hero.svg, 3 package marks, public/icon.svg`)
