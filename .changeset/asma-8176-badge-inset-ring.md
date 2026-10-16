---
'asma-ui-core': patch
---

ASMA-8176: `StyledBadge` strokes its ring on the inside, so a count badge finally
measures what Figma specifies.

Figma draws the badge's ring as an inside stroke, which costs no layout space. We
drew it as a CSS `border`, which does — and with `box-sizing: border-box` that 2px
came straight out of the badge's own box. The visible effects were a two-digit count
rendering 30px wide against Figma's 28px (node `15194-43826`), and a one-digit count
left with only `20 - 2 - 12 = 6px` of content box for an 8px digit, so the number
overflowed its own padding box.

The ring is now an inset `box-shadow`, which paints identically but is free of the
layout. Two-digit counts come back to Figma's 28px, the dot keeps its 12px outer size
and 2px ring, and the single-digit rule that pins the pill to an exact 20px circle now
has a full 8px content box to centre the digit in.

No API change, and nothing moves for callers: single digits and dots keep the same
outer dimensions. Counts of two characters or more are 2px narrower, which is the fix.
