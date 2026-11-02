---
'asma-ui-core': patch
---

ASMA-8597: UX round 3 on the `StyledTable` header (the owner's relay of Eugeniu's review, 2026-11-02).

- A sortable header that is hovered or keyboard-focused (`:focus-visible`) previews what it will look like right
  after a plain click. A sorted header whose click sorts again shows that direction in teal (`gama-500`, as at
  rest). One whose click removes the sort, and an unsorted one, show the grey `delta-600` glyph pointing the way a
  first click sorts. At rest a sorted glyph stays `gama-500`. This replaces the lighter `gama-400` sorted hover and
  focus of the previous round, so its contrast exception is gone. `aria-sort` still holds the current state, never
  the preview.
- In a multi-sort the preview follows TanStack's plain click: a sorted column that is not the last sort replaces the
  whole sorting, so it previews that replacement in teal (a removal becomes ascending); the last sort toggles or is
  removed. With Shift held the click multi-sorts instead, and the preview still shows the plain click (a known
  limitation).
- The resize handle's grab zone is 24 x 28 px with a 4 px radius, centred in the header content (it was 24 px wide
  and as tall as the 30 px content). Its bar is 4 x 24 px with a 4 px radius, centred in the zone (it was the full
  height with a 5 px radius). The bar is `delta-400` while the header is hovered. With the pointer over the zone the
  zone is filled `gama-50` and the bar is `gama-400`. While a column is being dragged it looks the same (the bar was
  `gama-500`), on every device, touch included. On touch-only devices the rest and hover look is unchanged: a grey,
  always visible bar with no fill. The grab area is 1 px shorter above and below.
