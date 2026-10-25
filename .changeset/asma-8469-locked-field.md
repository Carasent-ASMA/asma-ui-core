---
'asma-ui-core': minor
---

`StyledInputField`, `StyledDatePicker` and `StyledTimePicker` take an opt-in `lockedReason` for a locked field (disabled-states DIS-9, Figma Input field State=Locked): read-only with a lock icon at the end, the default cursor and a focus ring, and the reason opens on hover, focus and tap and is the field's accessible description. Fields without it are unchanged.

`StyledInputField` and the single `StyledDatePicker` also take an opt-in `readOnlyReason` for a read-only value the user can change elsewhere (disabled-states DIS-6, Figma Input field State=Read only): the label above and the value as text, with no border or fill, focusable and selectable with a focus ring and the default cursor, and the reason opens on hover, focus and tap and is the field's accessible description.
