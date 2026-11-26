---
'asma-ui-core': minor
---

ASMA-8469: new `StyledEmptyValue` shows an empty value as the empty-values pattern asks (EMP-1, EMP-2): an em dash hidden from screen readers, followed by `sr-only` words they read instead. The words are `label`, or "Not provided" / "Ikke oppgitt" by `locale` (default `'en'`); pass `label` for another text, such as "Ubesvart" for an unanswered question.

`StyledReadOnlyText` shows it for an empty value instead of "-" and takes a `locale` for its words; an `emptyText` passed by the app still wins. A read-only `StyledDynamicSelect` with nothing selected shows it too, in the select's `locale`.
