/**
 * Converts the licensed Neue Montreal TTF files into self-hosted WOFF2.
 * Run once per machine that has the font files:  npm run fonts
 * Override the source folder with:  FONT_SRC="D:/path/to/NEUE MONTREAL" npm run fonts
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { compress } from 'wawoff2'

const SRC = process.env.FONT_SRC || 'C:/Users/User/Downloads/NEUE MONTREAL'
const OUT = path.join(process.cwd(), 'public', 'fonts')

const FACES = [
  ['NeueMontreal-Light.ttf', 'NeueMontreal-Light.woff2'],
  ['NeueMontreal-Regular.ttf', 'NeueMontreal-Regular.woff2'],
  ['NeueMontreal-Medium.ttf', 'NeueMontreal-Medium.woff2'],
  ['NeueMontreal-Bold.ttf', 'NeueMontreal-Bold.woff2'],
]

await mkdir(OUT, { recursive: true })

let done = 0
for (const [from, to] of FACES) {
  const src = path.join(SRC, from)
  if (!existsSync(src)) {
    console.warn(`skip  ${from} (not found in ${SRC})`)
    continue
  }
  const ttf = await readFile(src)
  const woff2 = await compress(ttf)
  await writeFile(path.join(OUT, to), woff2)
  console.log(`ok    ${to}  ${(ttf.length / 1024).toFixed(1)}kB -> ${(woff2.length / 1024).toFixed(1)}kB`)
  done++
}
console.log(`\n${done}/${FACES.length} faces written to public/fonts`)
