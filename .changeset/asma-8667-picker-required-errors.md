---
'asma-ui-core': minor
---

ASMA-8667: date and time picker errors say Required for an empty required field and stay on one
line in a reserved helper row.

- **`StyledTimePicker` `required`.** The input is `aria-required`, and an empty field shows
  *Required* / *Obligatorisk* after blur or after the eraser empties it. Leaving the field for the open
  panel waits for the pick. An empty optional field still shows nothing.
- **Form errors and own messages.** A typed time that is invalid or before the start keeps the
  picker's own message; otherwise a consumer `error` with `helperText` replaces the empty-field
  *Required*.
- **Emptied required date.** `StyledDatePicker` now calls `onInputChange(undefined)` when a
  required field is emptied, like an optional one, so the consumer no longer keeps the old date.
  Its own *Required* stays when the consumer answers with `selected={undefined}`.
- **One line, more room.** Date and time picker roots carry `data-helper-room-box`; their helper
  row measures its room against the row around the whole picker, not the narrow field wrapper. The
  message runs to the right while the row has room and ends in an ellipsis (full text in `title`)
  only where it has none. The time picker message no longer wraps to two lines.
- **`reserveHelperText`** on the single `StyledDatePicker` keeps the helper row before any error,
  for use with `hideDefaultHelperText`. The time picker always keeps its helper row.
- `HelperRow`'s message may shrink below its content width, so a one-line message can be cut;
  wrapping messages render as before.
- **Floating `StyledInputLabel`.** At rest the label centres on the 40 px field instead of the
  whole form control, so a select's reserved helper row or error no longer pushes it down.
