---
'asma-ui-core': minor
---

ASMA-7099: new shared `StyledDialogFooter` — one responsive fixed bottom actions
pattern for dialogues and other layouts, across Ad Opus, Samhandling, Genesis and
Ad Voca.

The component owns the Figma "Dialog footer" contract (node `26769-135283`) as two
clusters: a `Left` cluster of destructive and utility actions, and a `Right` cluster
of Cancel plus the primary action. The Figma `State` property (Create / Edit / More /
Reset filter) is deliberately **not** a prop — it is the emergent result of which
actions the caller passes and how much room the container leaves, which is the point
of the ticket. Callers describe their actions once and the same footer resolves to the
approved 1-, 2-, 3- and 3+-action layouts.

Left-cluster planning reuses the `planToolbarActions` engine already behind
`DynamicToolbar` and `PageHeader`, driven by measured widths through the width
registry: labels hold while they fit, collapse to icon-only next, and retreat into an
icon-only "More" menu once even that overflows. The overflow menu opens *upward*,
because a footer sits at the bottom edge of its container. The right cluster is
measured but never collapsed or overflowed — the primary action must stay reachable at
every width.

`Mobile` is derived from the **container** width, not the viewport, so a footer inside
a narrow popover or a split pane compacts on a desktop screen too; the hand-rolled
footers this replaces keyed off `useIsMobileView()` and got that wrong. Padding and gap
step from 16px to 8px below the compact breakpoint, matching the two widths Figma
specifies (600px and 360px).

Also: `leadingSlot` for Figma's "Checkbox+Label" left variant or footer info text,
`fixed` for a sticky footer carrying the DS `Fixed bottom` shadow, `rounded` for the
bottom corners of a dialog paper, `type: 'submit'` so the primary action can drive a
surrounding `<form>`, and `locale` for the "More" trigger's accessible name (en/no).
