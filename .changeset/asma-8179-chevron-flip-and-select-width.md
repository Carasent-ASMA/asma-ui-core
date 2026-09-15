---
'asma-ui-core': patch
---

ASMA-8179: the dropdown chevron flips again, and an open select starts at the width
of the field that opened it.

**The chevron.** Every `rotate-180` in this package is replaced by a new `flip-180`
utility. `rotate-180` is not safe to write here: this package is a Tailwind 3 build and
emits it as `transform: … rotate(var(--tw-rotate)) …`, while a consuming app on Tailwind 4
emits the same class name as the individual `rotate` property. Both rules match the icon,
both apply, and 180° + 180° lands back at 360°. That is why the chevron flipped correctly
in this package's own Storybook and never flipped in the product (ASMA-7890) — the
collision only exists once a Tailwind 4 app loads this stylesheet. `flip-180` is defined
here alone, so it can only be applied once, and it sets `transform` rather than `rotate`
so `transition-transform` still animates it under Tailwind 3. `rotate-180` is also added to
the Tailwind `blocklist`, so it no longer appears in the published CSS at all and a consumer
writing it in its own JSX now gets its own build's rule and nothing else. Blocked rather than
merely unused, because Tailwind generates a class from any occurrence of the string —
including one in a comment.

**The select width.** `StyledSelect`'s size middleware hardcoded
`minWidth = rects.reference.width + 20`, so every dropdown was 20px wider than its
trigger, and `shift({ padding: 8 })` then slid it sideways to keep it on screen. On a
full-width field in a dialog or on mobile the list visibly overhung the field on both
sides. It now starts at the reference width, which is what the sibling
`StyledSelectAutocomplete` has always done. `minWidth` is kept rather than a hard `width`,
so a long option label can still widen the list instead of being clipped.

Two interaction tests cover both, including the reason the width one asserts the
middleware's output rather than the rendered box.

**VRT:** baselines for stories with an open select move — the list is 20px narrower.
