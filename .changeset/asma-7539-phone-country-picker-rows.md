---
'asma-ui-core': patch
---

ASMA-7539: the phone field's country picker matches the other menus. Its list has 8px above the
first country and below the last, every row is exactly 40px (the separator no longer adds a pixel),
and the separators use the menu colour (`delta-200`), with none under the last row.
