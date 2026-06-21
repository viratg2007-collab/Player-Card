// Rasterizes the SVG marks in public/ into PNG app icons. Run with:
//   node scripts/gen-icons.mjs
// Requires the `sharp` dev dependency.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

import { mkdir } from 'node:fs/promises'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const assets = join(root, 'assets')

const badge = await readFile(join(pub, 'favicon.svg'))
const maskable = await readFile(join(pub, 'icon-maskable.svg'))

// Web/PWA icons -> public/
const webJobs = [
  { src: badge, size: 192, out: 'icon-192.png' },
  { src: badge, size: 512, out: 'icon-512.png' },
  { src: maskable, size: 512, out: 'icon-maskable-512.png' },
  { src: maskable, size: 180, out: 'apple-touch-icon.png' },
]

for (const { src, size, out } of webJobs) {
  const png = await sharp(src, { density: 384 }).resize(size, size).png().toBuffer()
  await writeFile(join(pub, out), png)
  console.log(`wrote public/${out} (${size}x${size})`)
}

// Native source assets -> assets/ (consumed by `@capacitor/assets generate`).
// Naming follows the @capacitor/assets convention so it picks them up with no
// extra flags: logo.png (fallback/iOS), icon-foreground/background.png
// (Android adaptive), splash.png + splash-dark.png.
await mkdir(assets, { recursive: true })

// The ball mark on a transparent field, sized into the adaptive icon safe area.
const foregroundSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
    <g fill="none" stroke="#ffffff" stroke-width="44" stroke-linecap="round">
      <circle cx="512" cy="512" r="210"/>
      <path d="M435 335c77 116 77 250 0 354"/>
      <path d="M412 412l60 14M398 496l64 10M398 538l64-10M412 614l60-14"/>
    </g>
  </svg>`,
)

const nativeJobs = [
  // Full icon (navy + mark): iOS app icon source and universal fallback.
  { src: maskable, size: 1024, out: 'logo.png', density: 512 },
  // Android adaptive foreground (transparent) + solid background.
  { src: foregroundSvg, size: 1024, out: 'icon-foreground.png', density: 512 },
]
for (const { src, size, out, density } of nativeJobs) {
  const png = await sharp(src, { density }).resize(size, size).png().toBuffer()
  await writeFile(join(assets, out), png)
  console.log(`wrote assets/${out} (${size}x${size})`)
}

// Solid navy background for the Android adaptive icon.
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#0f172a' } })
  .png()
  .toFile(join(assets, 'icon-background.png'))
console.log('wrote assets/icon-background.png (1024x1024)')

// 2732 splash (light + dark): navy field with the ball mark centred.
const mark = await sharp(maskable, { density: 512 }).resize(900, 900).png().toBuffer()
for (const out of ['splash.png', 'splash-dark.png']) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: '#020617' } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(join(assets, out))
  console.log(`wrote assets/${out} (2732x2732)`)
}
