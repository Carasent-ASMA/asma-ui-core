---
'asma-ui-core': minor
---

ASMA-7622: new shared `PageHeader` component — one container-width-adaptive page
header for all systems.

The component owns the route heading: a 2-line clamp with the full string kept in
the DOM as the accessible name, `titleDataTest` (emitted as both `data-test` and
`data-testid`) and `titleRef` for host selector and focus contracts, and a native
tooltip only once the clamp is measured as actually truncating. Exactly **one**
heading element serves every state — normal, loading and search only change its
presentation — so focus placed on it is never dropped by a state flip.

Route-change focus is the host router's job, through the new `useRouteHeadingFocus`
hook: mount it where it survives the host's route changes and pass the ref to
`titleRef`. It is driven by a pending flag rather than the route key, so a heading
that appears *after* the navigation (a title supplied later by a widget event, or
one still loading) still receives the focus; the first render never steals it.
Ownership is per hook instance, so two route headings never contend and
StrictMode's replayed effects are a no-op.

Layout planning works from measured widths: the title is measured as an
unconstrained copy in the measurement strip, and the leading control and the
non-shrinking status slot are both subtracted from the action budget before labels
may collapse. The base height is identical at every width; `sticky` headers compact
once stuck (`data-stuck`) and write their measured height as `scroll-padding-top`
on the nearest scroll container, so a pinned header never covers keyboard-focused
content. The leading navigation control and heading semantics survive loading and
search, and focus moves into and out of the search slot.

Also: back/menu leading control or custom `leadingSlot`, adaptive actions with badge
counts and a "More" overflow, subtitle/status slots. Toolbar actions support
`measureInStrip: false` for stateful renderers that must mount exactly once — their
single visible mount is measured through the width registry and `estimatedWidthPx`
only bridges the gap until the first measurement. Strip copies no longer duplicate
production `data-testid`s. Toolbar translations gain `back`/`menu`/`close` (en/no).
