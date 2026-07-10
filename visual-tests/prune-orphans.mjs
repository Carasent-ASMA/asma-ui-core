// Delete baseline PNGs whose story id no longer exists in the built index.json.
// Invoked only by `scripts/vrt.sh accept` (never by `check`) so acceptance also prunes.
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const staticDir = path.resolve(here, '..', process.env.VRT_STATIC_DIR ?? 'storybook-static')
const screenshotsDir = path.join(here, '__screenshots__')

if (!existsSync(screenshotsDir)) process.exit(0)

const index = JSON.parse(readFileSync(path.join(staticDir, 'index.json'), 'utf8'))
const live = new Set(
    Object.values(index.entries)
        .filter((e) => e.type === 'story')
        .map((e) => `${e.id}.png`),
)

const orphans = readdirSync(screenshotsDir).filter((f) => f.endsWith('.png') && !live.has(f))
for (const f of orphans) {
    rmSync(path.join(screenshotsDir, f))
    console.log(`pruned orphan baseline: ${f}`)
}
console.log(orphans.length ? `pruned ${orphans.length} orphan baseline(s).` : 'no orphan baselines to prune.')
