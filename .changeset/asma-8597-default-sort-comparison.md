---
'asma-ui-core': minor
---

ASMA-8597: every `StyledTable` column now sorts with a default comparison (`sortingFns.styledDefault`) unless the column,
or the table's `defaultColumn`, names its own `sortingFn`. It sets `sortUndefined: false` in the same place, so empty cells
reach the comparison. Nothing is stored, and the first-click direction, `sortDescFirst`, the hover preview, `persistSorting`
and *Reset columns* do not change. A column with its own `sortingFn`, or one that an app's `defaultColumn.sortingFn` covers,
is not touched: its comparator and TanStack's handling of `undefined` before it stay exactly as they were (`sortUndefined: false`
is set only on the columns that sort with `styledDefault`, group leaves included). A column's own `sortUndefined` only decides
where `undefined` goes; `null`, `''`, whitespace, `NaN` and an invalid `Date` still go last through `styledDefault`. The
app's own `sortingFns` stay available beside `styledDefault`. That is the only opt-out.

What changes in an app after this bump:

- **Text order.** Text compares in the table's `locale` (`Intl.Collator`, with `'no'` as `nb`), ignoring case and accents, and
  digit runs compare as numbers (`svc-9` before `svc-10`). With `locale='no'`, æ, ø and å come after z. Tables of 10 rows or
  fewer used to compare plain, case-sensitive text, so capitals sorted first there; they no longer do. Rows that differ only
  by case or accent keep their data order. This applies to every sort a user chooses, and to a table that opens sorted by text
  (for example the participant tables in asma-app-directory, the catalogue tables in asma-app-editor, and `QnrModuleDetails`
  in asma-app-artifact).
- **Empty cells go to the bottom in both directions.** `undefined`, `null`, `''`, whitespace only, `NaN` and an invalid `Date`
  sort last in an ascending sort as well as a descending one. Before, `undefined` sorted first in a descending sort, and
  `null` and `''` could sort first in an ascending one.
- **Dates and numbers.** Numbers, `Date`s and booleans compare by value; two ISO 8601 date strings compare by time, so a
  fraction of `.5` sorts after `.123` and a `+01:00` string against a `Z` one compares as the same moment (a string that names
  a day that does not exist, such as `2026-02-30`, is compared as text, not as 2 March). Rows within the same
  second can therefore swap where the data holds ISO timestamps as strings (for example the auth errors, feature logs, MV
  logs and versions tables in asma-app-directory). Equal values keep the data order.
- **Locale changes.** A table that stays mounted when its `locale` changes sorts again in the new language.
- **App tests.** A test that asserts today's row order after a sort, or on first render, can fail on the bump, most likely
  where it sorts text with non-ASCII letters, mixed case or empty values. Search your tests for order assertions when you take
  this release.
