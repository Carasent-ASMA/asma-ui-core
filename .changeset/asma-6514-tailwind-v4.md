---
'asma-ui-core': minor
---

ASMA-6514: asma-ui-core now builds with Tailwind CSS v4. `dist/style.css` keeps the v3 output that
apps rely on: no preflight reset, unlayered `!important` utilities and design tokens, and the v3
border and `space-y` behaviour. Apps need no change. The stylesheet now also declares Tailwind's
default theme variables (`--spacing`, `--text-*`, `--radius-*`, …) in `@layer theme`.
