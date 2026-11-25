---
'asma-ui-core': patch
---

ASMA-8470: Escape closes a docked minimizable dialog while focus is inside it.

`MinimizableDialog` and `MinimizableDialogV2` close on Escape in their docked state, through the same path as the close button, so a running save still keeps them open. A menu, select or dialog inside the panel takes Escape first, and Escape pressed outside the panel leaves it open.
