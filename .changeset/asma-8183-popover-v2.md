---
'asma-ui-core': minor
---

Add `StyledPopoverV2` — the Design System Popover (ASMA-8183): an anchored surface with an optional
title, a required close control and two optional footer rows, in two content-driven variants. `info`
is a read-only container referenced by `aria-describedby` that is not focus-trapped (`Tab` leaves and
closes it); `action` is a `role="dialog"` with a focus trap, covering both the Filter pattern (changes
apply immediately, `Nullstill` clears) and the Actions pattern (a list of buttons; activation closes
the surface). Deliberately no `role="menu"` and no arrow-key navigation, and no arrow/anchor pointer.

The two footer rows follow the Figma frames exactly: the **Reset filter** row is `space-between`
(`viewResultsAction` left, `resetAction` right) and the **Actions** row (`footerActions`) is a single
right-aligned outlined button. `children` and all three footer slots may be render-props receiving
`close()`. The `AllCases` story gives every case its own trigger to open and operate; `Gallery` renders the same anatomies side by side, statically.

Separate from `StyledPopover`, which is untouched and stays the MUI-parity positioning primitive its
eight internal consumers depend on; those migrate across gradually. Deliberate addition to the frozen
API surface (DEC-003): one new runtime export, no existing export changed.

Also exports `FOCUSABLE_SELECTOR` from `src/hooks/useFocusTrap.hook` (internal path, not part of the
package barrel) so a trapped panel can place initial focus on the same element set the trap cycles.
