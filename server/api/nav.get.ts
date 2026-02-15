import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(() => {
  const path = join(process.cwd(), 'data', 'nav.json')
  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw) as { nav: unknown[] }
})
