---
'asma-ui-core': patch
---

ASMA-8073: the designer's final error copy (decision G4) — `StyledDatePicker`'s typed-date hint,
mask and built-in messages use dots, never slashes: *DD.MM.ÅÅÅÅ* / *DD.MM.YYYY*, typed input still
accepts a typed slash. `minDate` now reads *Select a date on or after the start date.* (same day is
allowed, matching G1) and `StyledTimePicker`'s `afterStartTime` message reads *Select a time at or
after the start time.* (G2).
