---
'asma-ui-core': patch
---

Drop four decomposable runtime dependencies with no change to the public API or rendered output (ASMA-7573, MUI-removal Phase 0):

- `lodash-es` → native (`compact` helper in `src/helpers/arrays`, plus inline `capitalize`/`isArray`/`isObject`/`isFunction`)
- `tailwind-merge` → `clsx`-only `cn()`
- `material-ui-popup-state` → the in-repo `usePopupState` hook
- `@react-input/mask` → the dependency-free `useInputMask` (`src/helpers/inputMask`)
