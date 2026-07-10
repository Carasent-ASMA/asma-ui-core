---
'asma-ui-core': minor
---

Reimplement the CSS-only, native-HTML, and Floating-UI component families without MUI, with zero public-API or design changes (ASMA-7573, MUI-removal Phases 1–3). The frozen export contract is enforced by an API-surface snapshot test.

- **Phase 1 (CSS-only):** `StyledTypography`, `StyledBadge`, the 7 passthrough shims (`Paper`, `Stack`, `Container`, `Avatar`, `Skeleton`, `FormLabel`, `ClickAwayListener`), `StyledDialogTitle`/`Content`/`Actions`, `StyledFormGroup` — Tailwind-first with a flat `resolveSx` adapter.
- **Phase 2 (native HTML + ARIA):** `StyledCheckbox`, `StyledSwitch`, `StyledRadio`/`StyledRadioGroup`, `StyledAccordion*`, `StyledDialog` (native `<dialog>`), `StyledTabs`/`StyledTab`, `StyledSlider` (single + two-thumb range), `StyledFormControlLabel`, and the `StyledChip`/`StyledInteractiveChip` cluster — **drops `@base-ui/react`** (~140 KB).
- **Phase 3 (Floating UI):** `StyledTooltip`, `StyledPopover`, `StyledMenu`/`StyledMenuList`/`StyledMenuItem`, `StyledDrawer` — **adds `@floating-ui/react`** (bundled in).

MUI runtime imports reduced 64 → 36. `@mui/material` + `@emotion` removal completes in Phase 4 (complex inputs, toasts, pickers, in-core table).
