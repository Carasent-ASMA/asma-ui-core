---
'asma-ui-core': minor
---

ASMA-8791: three additive APIs for app layouts.

- `StyledAccordionSummary` gains `chevronAlign="edge" | "title"`. The default `edge` keeps the
  right-hand chevron at the trigger's trailing edge; `title` keeps it immediately after the title.
  It has no effect with the default left-hand chevron.
- `StyledFormControlLabel` gains `classes.label`, appended to the label span, so a consumer can
  override the 14 px label type without losing the control association or disabled colour.
- `StyledFormColumn` gains `maxWidth`, defaulting to `var(--form-column-width)`. Pass `"none"` to
  let the column fill its container; Full fields keep their own 600 px cap.
