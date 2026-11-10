---
'asma-ui-core': patch
---

ASMA-8737: in a dialog header without a label, the title and the header actions (Close, Minimize,
Fullscreen, a custom header node) now share one row instead of leaving an empty row above the title.
Applies to `StyledDialog` (including a `<StyledDialogTitle>` child), `MinimizableDialog` and
`MinimizableDialogV2`. The actions stay level with the first title line however many lines the
title wraps to. Dialogs with a label keep the label and actions on top and the full-width title
below. The header is 44 px shorter, so a title can wrap one more line before the header stops
pinning.
