---
'asma-ui-core': patch
---

ASMA-8734: `StyledButton` defaults to `type="button"` instead of inheriting the native
`type="submit"`.

A `<button>` with no `type` is a submit button. `StyledButton` set none, so every one of
them placed anywhere inside a `<form>` submitted that form on click — including buttons
that are plainly not the save action. In the calendar's time plan editor the whole page is
one `<form>`, with the calendar inside it, so clicking the month arrows in `CalendarToolbar`
saved the time plan and redirected the user out of the editor mid-edit. The same went for
the "Today" button, the duplicate banner's dismiss ×, and "add description".

This has been worked around case by case for a while, which is the evidence it was the
wrong default: callers across the fleet carry either an explicit `type='button'` or an
`e.preventDefault()` in their `onClick` whose only job is to cancel the submit.
`StyledDialogFooter`, the one wrapper that got it right, already defaults its buttons to
`type: 'button'` and makes the primary action opt in with `type: 'submit'`.

An explicit `type` still wins, so a button that really does submit keeps working — pass
`type='submit'`, as `StyledDialogFooter`'s `primaryAction` does.

The same default is applied to the internal `StyledButton` copies under `datetime/` and
`table/`.
