---
'asma-ui-core': minor
---

ASMA-7099: `StyledDialogFooter` now chooses the left cluster's "More" menu by action
count instead of by available width.

Figma states the left cluster by count, not by room: at the same 600px frame it draws
both `State=Edit` (one action, inline and labelled) and `State=More` (the icon-only
overflow trigger). The previous implementation read that as a width problem, so two or
three actions rendered as separate inline buttons on a wide dialog and only folded into
the menu once they stopped fitting — which also meant the menu appeared and disappeared
as a dialog was resized.

From two actions up the cluster is now always the icon-only More menu. A lone action
stays inline, and width still governs the one thing it should: that action's label, which
collapses to icon-only when it no longer fits.

This restores the pre-migration behaviour for the three footers that had hand-built a
permanent More popover — calendar's event-template and task-template footers, and
notification's sms-template footer — which the ASMA-7099 migration had turned into inline
buttons on wide dialogs.
