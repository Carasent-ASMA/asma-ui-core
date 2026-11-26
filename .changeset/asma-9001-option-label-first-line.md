---
'asma-ui-core': minor
---

ASMA-9001: option labels get a supported first-line layout and an optional helper line.

`StyledFormControlLabel` now has a `helperText?: ReactNode` prop (and a `classes.helperText`
override hook). The helper renders under the option name at the label text indent in the Design
System Small 12/16 `delta-600` style, and is wired to the control with `aria-describedby` (merged
with a caller-supplied description). The accessible name is unchanged: `aria-labelledby` still
points only at the option name.

The radio/checkbox/switch target is centred on the **first** line of a wrapping label instead of
the vertical centre of the whole text block. A one-line label renders exactly as before, including
consumer `classes.label` typography overrides. The small radio wrapper is now 40×40 like the small
checkbox, so a mixed option list keeps one icon column and one label indent; the hover halo stays a
40px circle concentric with the target.

`StyledChip` / `StyledInteractiveChip` keep their control on the first line whenever the label
wraps, including a consumer-forced wrap at desktop widths; one-line chips are unchanged. The delete
affordance's first-line alignment is proven on the non-interactive `StyledChip`; the
interactive-chip-with-delete combination is a pre-existing nested-interactive limitation, out of
scope for ASMA-9001.

No new chip prop is needed: the existing `label: ReactNode` already covers richer
content, and a chip-level helper line would change the compact tag's height and selection
semantics. Apps can drop the `relative! -top-2!` / `gap-0!` workarounds: use `helperText` for
`StyledFormControlLabel`, and keep the chip's existing `label`/`classes.label` wrapping — the
control now follows the first line in both components.
