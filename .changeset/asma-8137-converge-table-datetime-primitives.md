---
'asma-ui-core': minor
---

The table and the date/time pickers now use the core `StyledButton`, `StyledCheckbox` and `StyledMenuItem` instead of their own copies (ASMA-8137, design sign-off: core for all three). Visible change in the table (row and header select checkboxes, column settings menu, row action menu, pagination and rows-per-page buttons) and in the date and time pickers (caption, footer and time panel buttons):

- Buttons: medium is 40px tall with 8px side padding and 16px text (was 38px, 4px padding). The focus ring follows the button variant.
- Checkboxes: 20px box in a 40px area (was 18px in 42px), with the core focus frame and indeterminate bar.
- Menu items: at least 40px tall, 16px side padding, Roboto (was 12px padding, font not set).

`StyledMenuItem` takes `reasonPlacement` (side the disabled reason opens on, default `left`). Enter and Space now dispatch a real click, so the containing menu closes as on a pointer click. A disabled item swallows its click but still forwards `onMouseDown`/`onMouseUp`.

Legacy `data-test` alias: `StyledButton`, `StyledCheckbox` and `StyledMenuItem` accept an optional, documented `data-test` prop rendered next to the `data-testid` from `dataTest`, for apps whose `testIdAttribute` is `data-test`. The table keeps `data-test` on `cell-select`, `expand-text-button`, `row-actions-button`, `reset-order-button` and `table-rows-count-button`, which editor, qnreditor, storage and crm tests query. Other table and date picker hooks are `data-testid` only.
