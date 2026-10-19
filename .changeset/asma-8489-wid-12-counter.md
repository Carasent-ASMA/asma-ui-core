---
'asma-ui-core': minor
---

ASMA-8489 (WID-12): a field with a character limit always shows its counter, such as
*12 av 100 tegn*, from the start.

- `StyledInputField` with `maxLength` (or `slotProps.htmlInput.maxLength`) and
  `StyledTextarea` with `maxLength` or `counterLimit` now show the counter without the
  `counter` prop. Pass `counter={false}` for a fixed format such as a postal code.
- The counter sits on its own line on the left, under the hint or error (Figma
  `45907:218317`). It used to sit on the right of the hint row.
- A locked (`readOnly`) input shows the counter. The read-only text area variants show none.
- A disabled field keeps the helper colour for the counter, like its hint; the Figma
  grey fails contrast.
