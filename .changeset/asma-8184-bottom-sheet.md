---
'asma-ui-core': minor
---

Add `StyledBottomSheet` — the Design System Bottom Sheet (ASMA-8184), the mobile (0–743px) form of the
Action popover. `StyledPopoverV2` with `variant='action'` now renders it automatically below 744px, so
the same props produce an anchored popover on tablet/desktop and a sheet on phones; `variant='info'`
stays anchored at every size.

A modal sheet on a native `<dialog>`: dimmed scrim, page scroll locked and `inert`, top corners 28px,
width up to 640px, height fitting the content up to 90vh (full-screen dialog at `max-height: 480px`).
Five equivalent dismiss routes — close button, "Vis resultater", scrim, Esc, drag down past 30% — none
of which commits anything. Focus moves to the sheet on open and back to the trigger on close; the
grabber is decorative. `Tab` only, no `role="menu"`, no arrow keys.

New optional `resultCount` prop on both components renders the standard "Vis resultater (N)" control
(debounced ~500ms, "Ingen treff" at zero and still enabled, 9999+ cap) and, in the sheet, announces it
from an in-sheet live region. Deliberate additions to the frozen API surface (DEC-003):
`StyledBottomSheet` and `formatResultsLabel`; no existing export changed.
