---
'asma-ui-core': minor
---

ASMA-7240: a **ticked** row that cannot be selected now renders its checkbox `readOnly` instead of
`disabled`.

The two are different facts and were drawn as one. A picker that keeps already-attached rows ticked
and locked was showing them in the disabled `delta-200` fill, which reads as "this is unavailable to
you" — the opposite of the truth, which is that you already have it. `StyledCheckbox` has shipped the
Read-only state for exactly this since the Figma spec was implemented (white box, `delta-500` border
and tick); the select column is its first consumer.

An **unticked** locked row is unchanged and stays `disabled`: the read-only box looks identical to an
empty selectable one, so marking those read-only would hide the only thing worth knowing about them.
Neither kind is operable — the cell still ignores click and keyboard, still carries `aria-disabled`,
stays out of the tab order and keeps the not-allowed cursor.

Pair it with the existing `getRowSelectionTooltip` option to say *why* a row is locked.
