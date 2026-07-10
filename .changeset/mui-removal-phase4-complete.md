---
'asma-ui-core': major
---

Complete the MUI removal: `asma-ui-core` no longer depends on `@mui/material` or `@emotion` (ASMA-7573, Phase 4). The public API and design system are preserved — enforced by the API-surface snapshot test — but MUI is no longer pulled in transitively.

- **Combobox:** `StyledSelectAutocomplete` and `StyledDynamicSelect` are a native ARIA combobox on `@floating-ui/react` (single/multiple selection, type-ahead, async loading, keyboard nav, `renderInput`/`renderOption`/`renderValue` contracts).
- **Snackbars/alerts:** `StyledAlert`, `StyledSnackbar` and the notistack content components are native (the notistack engine is retained; its replacement is a separate follow-up).
- **Fade/Popper, datetime pickers, and the in-core table** now use ui-core's own MUI-free components.
- **`@mui/material`, `@emotion/react`, `@emotion/styled`** removed from `dependencies` and `peerDependencies`; blessed additions are `@floating-ui/react` (and `sonner` reserved for the toast follow-up). Bundle ≈ 129 KB gzipped.

BREAKING CHANGE: `@mui/material` is no longer a (peer)dependency of `asma-ui-core`. Apps that import `@mui/material` directly must declare it themselves.
