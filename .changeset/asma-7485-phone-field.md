---
'asma-ui-core': minor
---

Country-aware phone field (ASMA-7485): new `StyledPhoneField` (country trigger + number input under one label, single helper row) and `StyledCountryFlag` (app-served SVG artwork, one file per country). Country data, per-country grouping, validation and all copy are injected by the consumer — pair it with `asma-core-helpers/phone`. `StyledSelectItem` gains an optional `id` so a parent listbox can point `aria-activedescendant` at a row. Additive only.
