---
'asma-ui-core': minor
---

ASMA-8875: `StyledTable` follows one keyboard rule everywhere (WAI-ARIA Grid): Tab enters and leaves the table, the arrow
keys move inside it. A keyboard user can now reach and use the controls inside a row (the select checkbox, the expand
chevron, the ⋮ menu, and controls an app puts in a cell), and the header no longer takes one Tab per column.

- The table has two tab stops: the header row and the active row.
  Every other control in the header and in the rows' cells, the table's own and the app's, is `tabindex="-1"`.
- In a row: Right/Left walk its controls in visual order, and Left from the first control returns to the row. Up/Down
  move between rows from anywhere in the row; Home/End go to the first/last row. Enter on the row opens it
  (`onRowClick`); Enter or Space on a control activates it. Space on the row ticks its select checkbox, or, with no select
  column, expands or collapses it. The arrows never expand or collapse a row. Tab leaves the table from the row or any
  control; Shift+Tab goes to the header. A click on a select checkbox now focuses it, so Space toggles it back.
  Left/Right move on from a closed select in a row (a select-only combobox, such as `StyledSelect`).
- Sub-rows: the rows of a StyledTable nested in a sub-row (`renderSubRows`) join the walk in visual order, and the
  outermost table keeps the one tab stop. `getSubRows` rows are ordinary rows.
- Wide tables (more than 20 centre columns, virtualised): Right/Left also reach controls in columns not rendered yet,
  which are scrolled into view first.
- The context-menu key, or Shift+F10, opens the focused row's ⋮ menu (a disabled ⋮ takes the focus and shows its
  reason); a mouse right-click keeps the browser's menu.
- A disabled ⋮'s reason, and a select checkbox's tooltip (`getRowSelectionTooltip`), open on keyboard focus and stay
  while the control has the focus (the reason used to close at once, as the table scrolled a pixel sideways for the ⋮).
- The header works like a row: Tab reaches the header row; Right/Left walk the sortable headers and the column settings
  pin, and Left from the first returns to the row; Home/End jump; Up/Down do nothing; Enter and Space sort. Tab from the
  header enters the body on the active row, Shift+Tab leaves the table, and Shift+Tab from the body returns to the header row.
- **Visible change — one focus look, 3px everywhere.** A focused row (body, nested or header) frames its cells 3px; a
  header control (sort header, column settings pin) frames its header cell; the expand chevron frames its body cell. A
  cell's own border is part of the 3px (the header cells' grey top and bottom borders take the focus colour), so no grey
  line shows next to the focus. While a header control has the focus, there is no frame around the whole header. The
  select checkboxes show the base-ui checkbox's focus frame around their box (shared through a new
  `styles/_checkbox-focus.scss`; the base-ui checkbox itself is unchanged). A focused row or control is scrolled clear of
  the sticky header, the sticky scrollbar/footer and the fixed columns; focusing the select checkbox no longer shifts it
  4px to the left, and focusing a control in a fixed column (the ⋮) no longer scrolls the table sideways.
- The expand column's header has a visually hidden name ("Expand" / "Utvid"), as the actions column's has.
- A dialog or popover rendered inside a row (a `StyledDialog` opened from a cell is a native `<dialog>` in place) is not
  part of the table: its controls keep their tab stops, its keys stay its own, and a table inside it owns itself.
- **Behaviour change.** Controls in cells, a nested table's included, are no longer tab stops, so a keyboard user
  reaches them with the arrow keys. A control in a hidden header (`hideHeader`) is no longer a tab stop either; apps no
  longer need to give it `tabIndex={-1}`. A table nested in a sub-row gives its tab stops to the outer table. The internal `meta.hideHeader` the
  table set is removed. New row method: `takeTabStop`. `focusNextRow`/`focusPrevRow` are unchanged (the keys no longer use
  them: they follow the DOM order).
