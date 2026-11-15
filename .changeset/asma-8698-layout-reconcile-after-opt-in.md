---
'asma-ui-core': patch
---

ASMA-8698: fixes a regression in 3.138.0. To save the per-render work of a table that does not save its column layout, a
commit made while `persistColumnLayout` was off recorded `''` as the signature of its columns and defaults, so a
`persistColumnLayout` change from `false` to `true` on a table that is already mounted skipped the reconcile that brings the
table state in step with columns, defaults or an order that changed in the meantime. A commit made while the layout is not
saved now records its inputs and no signature, and the signature is worked out from them when the table is opted in: the
decision (`columnLayoutInputsChanged`) is what it was before 3.138.0, with no per-render cost while the layout is off. Only a
table that flips the prop at run time is affected; one that sets it from its first render never was.

No other behaviour changes. The rest of this change is tests, pinning what 3.138.0 does: a handler-only `onSortingChange` table keeps its
own sorting state and arrows unchanged, a table the app owns that reads the saved sort with `usePersistedSorting` reads the
entry twice per mount (the hook's and the table's) and nothing after, and loading another key's page size writes nothing.
