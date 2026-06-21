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

// Native source assets -> assets/ (consumed by `npx @capacitor/assets generate`)
await mkdir(assets, { recursive: true })

// 1024 app icon (App Store requires a 1024 marketing icon).
const icon1024 = await sharp(maskable, { density: 512 }).resize(1024, 1024).png().toBuffer()
await writeFile(join(assets, 'icon.png'), icon1024)
console.log('wrote assets/icon.png (1024x1024)')

// 2732 splash: navy field with the ball mark centred.
const mark = await sharp(maskable, { density: 512 }).resize(900, 900).png().toBuffer()
for (const out of ['splash.png', 'splash-dark.png']) {
  const splash = await sharp({
    create: { width: 2732, height: 2732, channels: 4, background: '#020617' },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer()
  await writeFile(join(assets, out), splash)
  console.log(`wrote assets/${out} (2732x2732)`)
}
