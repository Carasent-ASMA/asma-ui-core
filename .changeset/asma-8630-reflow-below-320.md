---
'asma-ui-core': minor
---

ASMA-8630 (WCAG 2.2 SC 1.4.10 Reflow): on viewports narrower than any phone — e.g. a 320px window at 200%
zoom — every element stays on screen and the page scrolls only vertically. A new `max-xs:` Tailwind
variant (strictly below 320px, never inside table cells, in the `theme` layer so it beats apps'
`!important` utilities) drives it; at 320px and wider nothing changes. Below 320px:

- Button labels, chips, links, form labels and one-line titles wrap (long words break with hyphens)
  instead of truncating or overflowing; buttons and chips keep their Figma height while one line fits.
- `DynamicToolbar`, `StyledDialogFooter`, `StyledDialogActions`, the `StyledDialog` and
  `MinimizableDialogV2` headers, `StyledWidget` header/footer and the popover / bottom-sheet footer
  rows wrap their items; header buttons move above the label and title.
- `StyledDialogFooter` gives its left action the whole line when the right cluster wraps, so a lone
  action stays a button instead of collapsing into More.

At any width, `StyledWidget` keeps its icon from being squeezed by a long title, and
`StyledWidgetHeader` wraps its actions below the title when both no longer fit on one line.
