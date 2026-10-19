---
'asma-ui-core': minor
---

ASMA-8489: fields follow the field width pattern. Labels sit above the fields, each field is
Full or one of three steps, and a form is one column of at most 600 px.

- **Width tokens** in rem, as CSS variables and Tailwind `width`/`maxWidth` keys:
  `--field-width-xs` 8rem (128 px), `--field-width-s` 12.5rem (200 px), `--field-width-m` 20rem
  (320 px), `--form-column-width` 37.5rem (600 px), and `--field-width-full`, which is the column.
  Apps add the `width` and `maxWidth` keys of `tw-configs/twConfigs.json` to their Tailwind config to
  use `max-w-field-s` and the like.
- **`width?: 'xs' | 's' | 'm' | 'full'`** on `StyledInputField`, `StyledTextarea`, `StyledSelect`,
  `StyledSelectAutocomplete`, `StyledDynamicSelect`, `StyledFormControl`, `StyledDatePicker` and
  `StyledTimePicker`. It sets `width: 100%; max-width: <step>`, so a field shrinks in a narrower
  container and never overflows it.
- **New defaults.** `StyledInputField` (was 235 px), `StyledTextarea` (was 400 px), `StyledSelect`
  (was its content width), `StyledFormControl`, `StyledSelectAutocomplete` and `StyledDynamicSelect`
  are Full: 100% of their container, at most 600 px. The date field is S, input and calendar button
  included. The time field is XS (was 130 px). The phone field is unchanged. `fullWidth` is
  deprecated and has no effect, because Full is now the default. A numeric `StyledTimePicker` `width`
  still works and is deprecated.
- **Labels above the field.** `StyledInputField` and `StyledInputLabel` take
  `labelPlacement?: 'above' | 'floating'`, default `'above'`. The label is no longer cut with an
  ellipsis; it wraps. Its required mark is hidden from screen readers; the control is `required`.
  `fieldLabelAboveClass()` gives other libraries (rich text) the same label look.
  The label's spacing sits on a wrapper, because apps in the shell ship
  `label { padding: 0 !important }`. A required `StyledSelect` (in a required `StyledFormControl`) and
  date field are `aria-required`; a select is named by the `StyledInputLabel` in its form control.
  The date picker shows `title` and `label` together when both are set.
  `StyledSearchField` keeps its floating label, the one exception the pattern allows. The date and
  time pickers show `title` or `label` above the field.
- **`StyledFormColumn`** limits a form to the 600 px column, left-aligned.
- **`StyledFieldPair`** puts two fields in a row, 16 px apart: each field keeps its step, a Full
  field takes the rest of the row and is never narrower than S, and the pair stacks when the row is
  too narrow. Pass `legend` to group the two fields in a `fieldset`.
- **Full screen.** In a full-screen `MinimizableDialog` or `MinimizableDialogV2`, only Full fields
  and the column grow to the dialog's width (at most 1000 px). XS, S and M keep their width.
- **Character counter.** `StyledInputField` takes `maxLength`, `counter` and `locale`, and shows
  *12 av 100 tegn* / *12 of 100 characters* as the user types. `StyledTextarea` uses the same counter
  text and takes `locale`. Screen readers hear the count only near the limit.
  `fieldWidthForMaxLength(n)` gives the step a character limit picks: up to 9 characters XS, 15 S,
  27 M, longer Full.

**Rollout.** asma-ui-core is a kernel import-map member, so this release changes every form once
the kernel pin moves to it. Raise the kernel pin only after each app has had its visual check
(ASMA-8489, stages 2 and 3). Forms get taller, so dialogs with fixed heights need checking. A field
in a table, toolbar or filter bar that relied on `fullWidth` to grow past 600 px can pass
`style={{ maxWidth: 'none' }}`. The width and `display: flex` are inline styles, so a width from a
CSS module or `@apply` no longer wins (a Tailwind utility still does, through `important`), and fields
that were `inline-flex` are now block-level: two fields placed inline without a flex row stack. To
widen a subtree, override both `--form-column-width` and `--field-width-full`.
