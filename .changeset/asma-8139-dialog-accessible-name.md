---
'asma-ui-core': minor
---

`StyledDialog` is no longer announced by its test hook (finding ASMA-8139-D, WCAG 4.1.2). It was
`aria-label={dataTest}`, so a screen reader read "confirm dialog" instead of the title on screen. The
dialog is now named by its `dialogTitle`, else its `dialogLabel`, else the new optional `ariaLabel`
prop, else the first heading (`h1`–`h6` or `role="heading"`) in its content. A dialog with none of
these has no name and logs a development-only warning naming its `dataTest`; give it a title, a label,
`ariaLabel` or a heading. `dataTest` stays the `data-testid` hook and is never used as a name. No
consumer in asma-modules selected a dialog by the old name.
