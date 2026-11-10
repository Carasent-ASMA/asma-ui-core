---
'asma-ui-core': patch
---

ASMA-8838: `StyledPopover`, and so `StyledMenu`, no longer runs past the bottom of the window. Its paper is capped to the height available on its side of the anchor, 8 px from the viewport edge, and scrolls inside itself when the content is taller. A menu with custom content (e.g. a list of switches) was cut off and could not be scrolled on a short window or at high zoom. Content that fits keeps its natural height with no scrollbar. A `maxHeight` passed in `sx` or `slotProps.paper.sx`/`style` still wins over the cap.
