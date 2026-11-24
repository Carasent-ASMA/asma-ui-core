---
'asma-ui-core': patch
---

ASMA-9043: `StyledFormControlLabel`'s first-line offset now wins over consumer resets.

The offset (`margin-block-start: calc((control height − 1lh) / 2)`) lives in `@layer theme` so a
consumer's `classes.label` utility keeps winning, but `theme` is the earliest layer: a normal
declaration there lost to consumer `base` resets — Tailwind v4's preflight
`* { margin: 0; padding: 0 }` — and to any unlayered reset, such as the one richeditor's
`tiptap.css` adds. The declaration now carries `!important` and stays in `theme`, which is what
makes it survive: important beats normal, and among important declarations the earlier layer wins
and layered beats unlayered.

Effect in a consumer that ships both resets (the QNR editor does): the checkbox/radio/switch target
sits on the first label line instead of half a line above it. Consumer `leading-*` overrides keep
working, because they only change the `1lh` the calc reads. Components that do not reset margins
are unchanged.
