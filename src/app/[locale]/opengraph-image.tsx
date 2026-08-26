import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { client, locales } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { defaultLocale, isLocale, type Locale } from '@/i18n/routes'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = client.name

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/* The palette here mirrors the OKLCH ramp in globals.css, resolved to sRGB.
   Satori does not evaluate CSS custom properties or oklch(), so the values are
   computed here from the same two accent numbers in the client config. */
function oklchToHex(L: number, C: number, Hdeg: number) {
  const h = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  const enc = (v: number) => {
    const c = Math.min(1, Math.max(0, v))
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
  }
  return (
    '#' +
    lin
      .map((v) => Math.round(enc(v) * 255).toString(16).padStart(2, '0'))
      .join('')
  )
}

/**
 * The share card is the client's wordmark on their own paper colour, with the
 * same two-arc mark used as the site icon. No stock photograph, and nothing
 * that could be mistaken for a picture of a real wedding.
 */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const t = getDictionary(locale)

  const { chroma: c, hue: hh } = client.accent
  const paper = oklchToHex(0.986, 0.004, hh)
  const paper2 = oklchToHex(0.962, 0.008, hh)
  const ink = oklchToHex(0.235, 0.018, hh)
  const inkMuted = oklchToHex(0.452, 0.017, hh)
  const accent = oklchToHex(0.502, c, hh)
  const accentSoft = oklchToHex(0.955, c * 0.19, hh)

  const fontData = await readFile(
    path.join(process.cwd(), 'src', 'assets', 'NeueMontreal-Medium.ttf'),
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: paper,
          padding: '72px 80px',
          fontFamily: 'Neue Montreal',
          position: 'relative',
        }}
      >
        {/* Quiet geometry, echoing the generated site graphics. */}
        <div
          style={{
            position: 'absolute',
            right: -160,
            top: -160,
            width: 640,
            height: 640,
            borderRadius: 999,
            backgroundColor: accentSoft,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -60,
            top: -60,
            width: 440,
            height: 440,
            borderRadius: 999,
            border: `3px solid ${accent}`,
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="46" height="46" viewBox="0 0 64 64">
            <g fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round">
              <path d="M 24 10 A 22 22 0 0 0 24 54" />
              <path d="M 40 10 A 22 22 0 0 1 40 54" />
            </g>
            <circle cx="32" cy="32" r="6" fill={accent} />
          </svg>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              color: inkMuted,
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            {`${client.city}, ${client.region}`}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              fontSize: client.name.length > 26 ? 82 : 104,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: ink,
              maxWidth: 900,
              display: 'flex',
            }}
          >
            {client.name}
          </div>
          <div style={{ width: 220, height: 4, backgroundColor: accent, display: 'flex' }} />
          <div style={{ fontSize: 30, color: inkMuted, maxWidth: 820, display: 'flex' }}>
            {t.pages.home.hero.eyebrow}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 24,
            color: inkMuted,
            borderTop: `2px solid ${paper2}`,
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex' }}>{client.origin.replace('https://', '')}</div>
          <div style={{ display: 'flex' }}>{t.localeShort}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Neue Montreal', data: fontData, style: 'normal', weight: 500 }],
    },
  )
}
