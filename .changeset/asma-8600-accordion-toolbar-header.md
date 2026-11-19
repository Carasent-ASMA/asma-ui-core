---
'asma-ui-core': minor
---

ASMA-8600: `StyledAccordionDetails` gains an opt-in `toolbarHeader` prop for an accordion whose header is a `DynamicToolbar` directly above a table. It sets `data-toolbar-header` on the content element, and the content's padding-top then follows the toolbar's `data-layout`: `0` for `inline` (the 72 px summary row already leaves 16 px under the 40 px controls) and `1rem` for every other layout (`compact`, `stacked`, `selection-split`), so the controls-to-table gap is the Figma 16 px instead of 24 px (inline) or 8 px (compact). The default is unchanged: without the prop the content keeps `padding: 0.5rem 1rem 1rem 1rem`. The rules are literal declarations in `StyledAccordion.module.scss` (no `!important`), and a consumer `contentClassName` with an important padding utility still wins.
