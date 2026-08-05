---
'asma-ui-core': patch
---

Fix `StyledTooltip` rendering above native modal dialogs by portaling into the open dialog subtree and promoting the floating element into the browser top layer.
