---
'asma-ui-core': patch
---

ASMA-8737: dialog header matches the Figma `_dialog header` (DS_draft `332:64021`) 1:1 in
`StyledDialog`, `MinimizableDialog` and `MinimizableDialogV2`.

- The actions row (label plus buttons, or title plus Close) is 32 px high, not 44 px, with a
  16 px gap between the label and the buttons and 8 px between buttons.
- Header padding is 16 px top and bottom from 744 px (96 px for a one-line labeled header), and
  12 px with a 4 px row gap below it (88 px).
- The title is SemiBold, 24/32 from 744 px and 20/28 below it (was Bold, 24/32 and 20/26).
- The label is Helper 14/20 `delta-700` on one line with an ellipsis, in all three shells.
- Every header has the 1 px `border/separator` (#d3d8df) line, drawn inside the header height as in
  Figma; the minimizable dialogs' CSS border used to add 1 px (97 px headers).
