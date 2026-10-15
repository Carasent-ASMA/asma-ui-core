---
'asma-ui-core': minor
---

ASMA-8305: unavailable and running actions explain themselves (disabled-states DIS-1…DIS-8, submit-buttons SUB-4/SUB-8).

- New `disabledReason` on `StyledButton`, `StyledLink`, `StyledMenuItem`, `StyledTab`, `StyledChip`,
  `StyledInteractiveChip`, `DynamicToolbarAction`, row actions and `StyledWidget.viewMore`. The control stays
  focusable with `aria-disabled`, and the reason shows on hover, focus and tap and stays as its accessible
  description.
- `StyledButton loading` keeps the label and focus, sets `aria-busy`, ignores repeated presses and announces
  progress (`loadingAnnouncement`, `locale`).
- Dialogs (`StyledDialog`, `MinimizableDialog`, `MinimizableDialogV2`) wait while a button inside them is
  loading: Esc, backdrop and X are ignored, and Close/Cancel show `busyReason` ("Wait until saved" by
  default). This includes `MinimizableDialogV2` header actions. A button can opt out with `holdsDialog={false}`.
- `DynamicToolbarAction.loading` makes inline and More-menu actions busy.
