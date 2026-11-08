---
'asma-ui-core': minor
---

ASMA-8183: `PopoverSheet` and `StyledBottomSheet` take a `locale` prop (en/no), like `StyledButton` and `StyledDialog`.

It sets the language of the built-in result label and of the close button's accessible name. The label was always Norwegian, so an English page showed *Ingen treff* and *Vis resultater (N)*. English reads *Show results (N)*, *No matches* and *Show results*, from the spec's copy table, and the close button is *Close*.

English is the default, as for the other ui-core components. Pass the app's `i18n.code`; a consumer that passes neither `locale` nor `closeLabel` now gets the English labels. `formatResultsLabel` takes the locale as a second argument.
