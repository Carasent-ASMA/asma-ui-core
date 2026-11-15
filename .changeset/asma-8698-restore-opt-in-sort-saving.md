---
'asma-ui-core': patch
---

ASMA-8698: restores the opt-in for saving a table's sort. 3.138.0 saved the sort of **every** `StyledTable` with a `uniqueKey` by default.
It was released ahead of the order planned for it (the legacy settings migration, every app's PR, a preflight over the apps, the docs, and only
then the default), so an app that bumped to it would have started saving sorts under keys that still carry patient, questionnaire or record ids,
and on drag and drop tables. This version goes back to the rule of 3.137.2: a table saves and restores its sorting only when it writes
`persistSorting`, and a `uniqueKey` alone saves widths and page size only. The code is byte-identical to 3.137.2's.

Everything 3.138.0 changed in the persistence path goes back with it: the default, and the smaller changes beside it (no page size written on mount,
no per-render serialisation of settings that are not saved). They return with the default, as a later release, with the fixes its audit asked for.
An app that is already on 3.138.0 sees its tables stop saving a sort they did not opt in; entries already written under `${uniqueKey}:sorting` are
not read and not removed.
