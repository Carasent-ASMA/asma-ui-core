---
'asma-ui-core': patch
---

ASMA-8470: Escape in an edited fullscreen `MinimizableDialog` no longer flashes its "Delete changes?" confirm.

`useFocusTrap` now `preventDefault()`s the Escape it hands to `onEscape`. Chrome's default action for that keydown closed the modal confirm opened in the same keypress, so it flashed for about 20 ms. An Escape that a nested layer already claimed, or that comes from a dialog stacked on the panel, is left to that layer. Without `onEscape` the key is untouched.
