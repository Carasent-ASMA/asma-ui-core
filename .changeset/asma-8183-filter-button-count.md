---
'asma-ui-core': minor
---

ASMA-8183: `StyledFilterButton` and `StyledFilterMenu` accept `activeCount` — the number of filter
controls that differ from the page default (the page computes it).

The trigger then reads `Filter (N)`, which is also the accessible name of an icon-only trigger, and shows the
"filters applied" dot when N > 0. `filterIsActive` is now optional and only drives the dot when `activeCount` is
not given, so existing callers keep working.
