---
'asma-ui-core': patch
---

ASMA-8151: the toolbar's "More" overflow menu now closes when its own trigger is
pressed again, rather than only on a press somewhere else.

`ToolbarActionGroup` passed the state setter straight to the trigger, so every press
set the anchor and none cleared it. The press does reach the button rather than being
swallowed on its way: `StyledPopover` excludes the anchor from its outside-press
handler on purpose, which leaves dismissal to the trigger — and the trigger never did
it. It now toggles.

This affects every module that gives `DynamicToolbar` more actions than fit inline, so
the same menu misbehaved everywhere it overflowed. Found in the design review of
ASMA-7327.
