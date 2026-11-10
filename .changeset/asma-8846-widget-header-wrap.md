---
'asma-ui-core': patch
---

ASMA-8846: the `StyledWidget` header wraps at every width. When the whole title and `headerRight` don't fit on one row, `headerRight` moves to a row of its own, right-aligned, instead of squeezing the title onto several lines (the time-tracking "My registered hours" filter at 320–410 px). The icon and title now sit in one wrapper `div`, so they stay together on the first row. Below `xs` that wrapper is `display: contents`, so the header looks as before there. An empty `headerRight` slot is hidden: it no longer takes a gap beside the title or wraps onto a blank row.
