---
'asma-ui-core': minor
---

Disabled controls stay focusable (ASMA disabled-states pattern DIS-2, DIS-3, DIS-8, ASMA-8305), so
keyboard and screen-reader users can find an unavailable action and the reason it gives:

- `StyledButton` styles `aria-disabled="true"` exactly like `:disabled`.
- `StyledDialogFooter` renders `disabled` and `loading` as `aria-disabled` (plus `aria-busy`) instead of
  native `disabled`, blocking the click and form submit; a loading button keeps focus.
- `DynamicToolbar` actions with `disabled` are `aria-disabled` with the click blocked.
- `StyledMenuList` arrow keys, Home and End visit disabled menu items (including table row-action
  menus); opening still focuses the first enabled item.
- `StyledTab` with `disabled` is `aria-disabled`, on the arrow-key path and not selectable. New optional
  `tooltip` prop gives its reason on hover and focus, as its accessible description.
- `StyledChip` that would be clickable stays focusable and `aria-disabled` when disabled; the chip
  group of `StyledDynamicSelect` therefore keeps unavailable options in the Tab order.
- `StyledSelectAutocomplete` keyboard navigation visits disabled options; Enter and Space still refuse
  them. In `StyledDynamicSelect`, a disabled option's `getOptionTooltip` reason is its accessible
  description and opens while the keyboard is on it.
- A table row whose actions are all disabled keeps its ⋮ focusable, with the reason on hover, focus and
  tap.
- `StyledTooltip` describes a focusable roving-tabindex item (an unselected tab) when its wrapper holds
  nothing tabbable, and no longer adds itself to a control already described by the same text, so a
  disabled control's permanent reason is not read twice.

Consumers that asserted `toBeDisabled()` on these controls should assert `aria-disabled="true"` instead.
