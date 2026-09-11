---
'asma-ui-core': minor
---

ASMA-7099: `StyledDialogFooter` gains `loading`, `endIcon` and `tooltip` on its
right-cluster buttons.

All three come from migrating the real hand-rolled footers rather than from
guesswork:

- `loading` shows a spinner after the label and disables the button. The footers
  being replaced swapped the label *for* a spinner, which changes the button's
  width mid-submit — that is what the hard-coded `w-[98px]` / `w-[103px]`
  workarounds in crm were compensating for. Keeping the label makes the width
  stable by itself, and the button is marked `aria-busy`.
- `endIcon` mirrors `StyledButton`, for the footers that already render a
  trailing indicator.
- `tooltip` wraps the button in a `StyledTooltip`. A falsy value renders no
  tooltip, so the prevailing `tooltip={disabled && 'Locked for editing'}` idiom
  reads naturally. The tooltip anchors on a wrapper around the button, because a
  disabled button emits no pointer events — and explaining *why* the primary
  action is disabled is the only reason these footers use a tooltip at all.
