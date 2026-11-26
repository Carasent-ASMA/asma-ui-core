---
'asma-ui-core': minor
---

ASMA-8597 (Ana Rozimova, Jira comment 95216; the owner, 2026-11-11): a `StyledTable` header whose label is cut short by its
column (an ellipsis) now shows the full text in the table's tooltip, on hover and, for a sortable header, on keyboard focus.
A label that fits has no tooltip. This is a visible change in every table, with nothing to opt in to.

- **Follows the layout.** It is worked out from the rendered label and re-checked whenever the column is resized, the label
  changes or the sort slot opens. An unsorted sortable header takes its 20px slot from the label while it is hovered or
  keyboard-focused, so a label with less than 20px to spare gets its tooltip for that very hover.
- **Visual only.** The header's accessible name already holds the full text, so the sort button gets no `aria-describedby`
  and keeps its name; the column settings pin is unchanged. Escape closes the tooltip and the pointer can move onto it
  (WCAG 1.4.13). The keyboard behaviour of the header (ASMA-8087, ASMA-8702) is unchanged.
- **Which text.** The text the column settings list the column by: `pinnedHeaderText`, else a string `header`. A function
  header with neither has no tooltip. A hidden header (`hideHeader`) has none, and none shows while a column is dragged.
- **`StyledTooltip` gets `describesTrigger`** (default `true`, so nothing changes). `describesTrigger={false}` makes a
  tooltip visual only: it opens and closes as before, but the trigger is not given `aria-describedby`. Use it when the
  tooltip only repeats the trigger's accessible name.
- **The sort indicator is as Figma has it.** Measured in Chromium: the slot is 20 × 28px, directly after the label, and the
  drawn triangle is 11.67 × 5.83px at (4.17, 11.67) of the slot (the glyph is 28 × 28px at x = -4). Nothing changed there,
  and the +20px width of a sortable column (D16) is untouched; a test now pins the measurement.
