---
'asma-ui-core': minor
---

Reimplement the outlined-input chrome and single-select dropdown without MUI (ASMA-7573, MUI-removal Phase 4a–4b). Zero public-API changes; enforced by the API-surface snapshot test.

- **Input chrome:** `StyledFormControl` (+ a form-field context), `StyledInputLabel`, `StyledFormHelperText`, and `StyledInputField` (`TextField` replacement) are now native — a shared `field-styles` module renders the border and a floating label (white-background mask, no fieldset notch). Supports multiline, start/end adornments, a clear button, and error/helper text.
- **Select:** `StyledSelect` is a Floating-UI `role="listbox"` trigger (single-select) that reports focus/filled state into the surrounding `StyledFormControl`; `StyledSelectItem` is a native `role="option"`.

MUI runtime imports reduced 36 → 28. The Autocomplete combobox, toasts, pickers, and in-core table remain (later Phase 4 steps) before `@mui/material` + `@emotion` leave `package.json`.
