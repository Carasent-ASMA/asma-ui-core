---
'asma-ui-core': patch
---

ASMA-8427: `PathfinderCard` keeps items within the card. Expanded, each item is capped at the card's
width, so a value longer than the card can wrap or truncate instead of running past its edge.
Collapsed and stacked (on a phone), items are capped rather than stretched to the card's width, so
an item that centres its own content stays at the start of the line.
