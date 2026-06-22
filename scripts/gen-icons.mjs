// public/icon.svg → PNG 아이콘(192/512) + favicon.ico 생성
// 실행: node scripts/gen-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(resolve(root, 'public/icon.svg'))

await sharp(svg).resize(192, 192).png().toFile(resolve(root, 'public/icon-192.png'))
await sharp(svg).resize(512, 512).png().toFile(resolve(root, 'public/icon-512.png'))

const png48 = await sharp(svg).resize(48, 48).png().toBuffer()
const ico = await pngToIco(png48)
writeFileSync(resolve(root, 'public/favicon.ico'), ico)

console.log('✓ icons generated: icon-192.png, icon-512.png, favicon.ico')
