---
'asma-ui-core': minor
---

ASMA-8073: the built-in `StyledDatePicker` and `StyledTimePicker` error messages use the Figma error
copy in English and Norwegian, the same strings as the `asma-core-helpers` validation catalog.

- Date: *Enter a valid date in DD.MM.YYYY format.*, *Enter a valid day.*, *Enter a valid month.*,
  *Enter a year between 1900 and 2100.*, *Enter a valid date.*, *Select a date after the start
  date.*, *Select another date.*, *Select today or a future date.*, *Select today or an earlier
  date.* The Norwegian message for an unavailable date was *Dato er ugyldig* (the date is invalid);
  it is now *Velg en annen dato.*
- Time: *Enter a valid time in HH:mm format.* and *Select a time after start time.*
- *Required* / *Obligatorisk* is unchanged. A consumer `errorText` or `helperText` still wins.
