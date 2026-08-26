import { readFileSync } from 'node:fs'
import path from 'node:path'

/** OKLCH -> linear sRGB (clamped). */
export function oklchToLinear(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)))
}

export function hex(L, C, H) {
  const enc = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
  return (
    '#' +
    oklchToLinear(L, C, H)
      .map((v) => Math.round(Math.min(255, Math.max(0, enc(v) * 255))))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  )
}

/** Reads the accent out of the single client config file. */
export function readClient(cwd = process.cwd()) {
  const src = readFileSync(path.join(cwd, 'src/config/client.config.ts'), 'utf8')
  const grab = (key) => new RegExp(`${key}:\\s*'([^']*)'`).exec(src)?.[1] ?? ''
  const chroma = Number(/chroma:\s*([0-9.]+)/.exec(src)?.[1])
  const hue = Number(/hue:\s*([0-9.]+)/.exec(src)?.[1])
  return {
    name: grab('name'),
    slug: grab('slug'),
    city: grab('city'),
    region: grab('region'),
    accent: { chroma, hue },
  }
}

/** The same ramp as src/app/globals.css, resolved to hex for SVG output. */
export function buildPalette({ chroma: c, hue: h }) {
  return {
    paper: hex(0.986, 0.004, h),
    paper2: hex(0.962, 0.008, h),
    paper3: hex(0.928, 0.012, h),
    ink: hex(0.235, 0.018, h),
    inkMuted: hex(0.452, 0.017, h),
    line: hex(0.878, 0.011, h),
    lineStrong: hex(0.795, 0.015, h),
    accent: hex(0.502, c, h),
    accentInk: hex(0.432, c, h),
    accentSoft: hex(0.955, c * 0.19, h),
    accentLine: hex(0.86, c * 0.35, h),
    accentMid: hex(0.72, c * 0.6, h),
    onAccent: hex(0.99, 0.004, h),
  }
}

/** Deterministic PRNG so a regenerated set is byte-identical. */
export function rng(seedText) {
  let s = 2166136261
  for (let i = 0; i < seedText.length; i++) {
    s ^= seedText.charCodeAt(i)
    s = Math.imul(s, 16777619)
  }
  return function next() {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const round = (n) => Math.round(n * 100) / 100
