---
'asma-ui-core': patch
---

ASMA-8702: a keyboard user can now reach the `StyledTable` header. The header row is no longer a tab stop, so Tab
walks the sortable headers and then the column settings pin, in visual order. Enter and Space sort a header; Enter on
the pin opens the column settings, and Tab reaches Reset columns.

- Tab on the last header control moves focus to the active body row (the one the user left), and Shift+Tab from the
  body moves focus to the last header control. The body keeps ASMA-8087's model: one roving tab stop, Up and Down
  between rows, Enter, and Tab leaving the table forwards.
- Behaviour change in every table: the header is now in the Tab sequence, so a wide table has one tab stop per sortable
  column. Before, the header row was one stop that went straight to the body.
- A table with `hideHeader` skips its header: its sort headers, pin and select-all checkbox are not tab stops, while
  its column names and `aria-sort` stay in the accessibility tree. With no header control at all, Tab goes straight to
  the body.
- Shift+Tab from the footer's row count goes back into the table at the active row; it used to go to the header row.
