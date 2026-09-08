---
'asma-ui-core': minor
---

ASMA-7622: new shared `PageHeader` component — one container-width-adaptive page
header for all systems. The component owns the route heading (2-line clamp, full
string as accessible name, `titleDataTest`/`titleRef` for host selector contracts,
`focusKey` moves focus to the heading on route change), measures the title as an
unconstrained copy in the measurement strip, keeps the same base height at every
width, compacts once stuck when `sticky` (`data-stuck`), keeps the leading
navigation and heading semantics through loading and search modes, and moves
focus into/out of the search slot. Back/menu leading control or custom
`leadingSlot`, adaptive actions with badge counts and "More" overflow,
subtitle/status slots. Toolbar actions support `measureInStrip: false` (plan by
`estimatedWidthPx`) for stateful renderers that must mount exactly once; strip
copies no longer duplicate production `data-testid`s. Toolbar translations gain
`back`/`menu`/`close` strings (en/no).
