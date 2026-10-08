---
'asma-ui-core': patch
---

ASMA-8176: a `StyledBadge` with no children now lays out in normal flow for **every**
variant, not only `variant='dot'`.

A badge decorates a host by wrapping it, and when there is one, nothing changes: the
badge stays absolutely anchored to the host's corner. But a caller that anchors the
badge itself — to a tab cell, a toolbar button, a menu row — passes no children, and
until now the component anchored it anyway. The root collapsed to 0x0 and the badge
hung off that empty point, translated by half its own size. Measured in Chromium, a
hostless count badge beside two neighbours came out as:

```
root:  { x: 61, y:  9, w:  0, h:  0 }   reserves no space
pill:  { x: 51, y: -1, w: 20, h: 20 }   10px up and left, outside its own root
```

The 3.100.0 release fixed this for the dot; this extends the same rule to the count.
As there, `className` now lands on the root rather than the inner span, so positioning
a hostless badge places the badge instead of moving it inside its own box.

This is why so many call sites hand-rolled a pill out of Tailwind classes rather than
using the component, and those copies are worth replacing now — not only for
consistency. `StyledBadge` applies its fill and border as inline styles, whereas a
hand-rolled badge relies on utility classes in `@layer utilities`. Since this package
ships its Tailwind build **unlayered**, its `*,:before,:after{border:0 solid #e5e7eb}`
reset outranks any consumer's layered `border-[color:…]` utility — cascade layers beat
specificity — so a hand-rolled badge silently renders Tailwind's default gray border
instead of `--colors-badge-border-count`.

A hostless count in normal flow moves 10px right and no longer overlaps its left
neighbour. One whose root is pinned to a corner moves 10px toward the inside of that
corner, for example 10px down and left for top/right. Drop offsets that made up for the
old overhang.
