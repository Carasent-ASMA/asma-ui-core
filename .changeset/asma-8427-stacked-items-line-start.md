---
'asma-ui-core': patch
---

ASMA-8427: `PathfinderCard` collapsed and stacked (on a phone) caps its items at the card's width
instead of stretching them to it, so an item that centres its own content stays at the start of the
line. The value above it still truncates.
