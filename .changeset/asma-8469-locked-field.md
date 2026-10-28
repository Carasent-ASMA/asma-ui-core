---
'asma-ui-core': minor
---

`StyledInputField`, `StyledDatePicker` and `StyledTimePicker` take an opt-in `lockedReason` for a locked field (disabled-states DIS-9, Figma Input field State=Locked): read-only with a lock icon at the end, the default cursor and a focus ring, and the reason opens on hover, focus and tap and is the field's accessible description. Fields without it are unchanged.

`StyledInputField` and the single `StyledDatePicker` also take an opt-in `readOnlyReason` for a read-only value the user can change elsewhere (disabled-states DIS-6, Figma Input field State=Read only): the label and the value laid out like `StyledReadOnlyText` (Figma Title + data: the value right under the title, Body 16/24 in delta-700, 48px together), with no border or fill, focusable and selectable with a focus ring and the default cursor, and the reason opens on hover, focus and tap and is the field's accessible description.

New `StyledReadOnlyText` shows a value that cannot be changed as text (disabled-states DIS-6, Figma Title + data): the title is Body Base Semibold 16/24 in delta-800 with the value right under it, or "Title: value" on one line with `horizontal`; the value is Body 16/24 in delta-700. Optional `titleIcon` (24px), `titleInfo` (20px), `startIcon` and `endIcon` (24px) sit 4px from the text, and `helperText` (with an optional 20px `helperIcon`) shows under the value in Helper 14/20 delta-600. No field, fill, border or reserved helper row; an empty value shows "-".
