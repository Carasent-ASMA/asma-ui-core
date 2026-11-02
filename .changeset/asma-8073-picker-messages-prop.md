---
'asma-ui-core': minor
---

ASMA-8073: `StyledDatePicker` (single and range) and `StyledTimePicker` take an optional `messages`
prop: per-key `{ en, no }` overrides of the built-in validation messages, merged over the defaults.

An app can pass its own catalog strings for some messages and keep the defaults for the rest,
instead of replacing every message with `errorText`. `errorText` and `helperText` still win. The
new types are `DatePickerMessages` and `Partial<TimePickerHelperMessages>`; no runtime export
changes.

`useDatePickerValidation` keeps its signature. Its `errHelperText` now follows the current messages,
and `handleValidation` no longer changes identity when the messages object does, so a parent that
passes a new `messages` object on every render keeps the field's error.
