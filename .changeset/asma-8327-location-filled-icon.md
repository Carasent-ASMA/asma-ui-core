---
'asma-ui-core': minor
---

ASMA-8327: new `LocationFilledIcon` — the filled map pin from the Design System's
`location_on` component.

The existing `LocationIcon` is the *outlined* variant of the same glyph (a hollow pin
with a solid centre dot), which is what consumers got whenever a design asked for the
filled pin. The two read very differently at the 12–16px sizes they are used at, so
the Ad Voca calendar event card (ASMA-8327) needs the filled one next to an event's
location.

The path is the Design System `location_on` component's 24px SVG export, verbatim —
not redrawn, not rescaled, and not adapted from the outlined sibling. Only `fill`
changes, to `currentColor`. `LocationIcon` is untouched, so nothing that uses it
changes.

Name: `LocationIcon` already holds the unsuffixed slot that this library's convention
reserves for the filled variant (`CheckFactIcon` / `CheckFactOutlineIcon`), and
renaming it would break every consumer. `LocationFilledIcon` says which one it is
without that cost.
