// Rasterizes the SVG marks in public/ into PNG app icons. Run with:
//   node scripts/gen-icons.mjs
// Requires the `sharp` dev dependency.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

const badge = await readFile(join(pub, 'favicon.svg'))
const maskable = await readFile(join(pub, 'icon-maskable.svg'))

const jobs = [
  { src: badge, size: 192, out: 'icon-192.png' },
  { src: badge, size: 512, out: 'icon-512.png' },
  { src: maskable, size: 512, out: 'icon-maskable-512.png' },
  { src: maskable, size: 180, out: 'apple-touch-icon.png' },
]

for (const { src, size, out } of jobs) {
  const png = await sharp(src, { density: 384 }).resize(size, size).png().toBuffer()
  await writeFile(join(pub, out), png)
  console.log(`wrote public/${out} (${size}x${size})`)
}
