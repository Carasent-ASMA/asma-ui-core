---
'asma-ui-core': minor
---

`StyledInputField`, `StyledDatePicker` and `StyledTimePicker` take an opt-in `lockedReason` for a locked field (disabled-states DIS-9, Figma Input field State=Locked): read-only with a lock icon at the end, the default cursor and a focus ring, and the reason opens on hover, focus and tap and is the field's accessible description. Fields without it are unchanged.
