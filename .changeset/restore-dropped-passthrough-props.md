---
'asma-ui-core': patch
---

Restore MUI-passthrough prop signatures dropped during the MUI removal, closing frozen-contract (DEC-003) regressions surfaced by consumer `tsc` (ASMA-7573). Type-only fix — no runtime export or design change; the API-surface snapshot is unaffected.

- **`StyledDrawer`** — re-add `ModalProps` (`{ keepMounted? }`); typed no-op (the panel stays mounted for the slide transition).
- **`StyledMenuItem`** — re-add `dense`, honored as compact vertical padding.
- **`StyledMenu`** — re-add `slotProps.paper` (`className`/`sx`/`style`), forwarded to the menu paper via `StyledPopover` (whose paper slot now also accepts `style`).
- **`StyledDialog`** — re-add `classes` (`classes.paper` merged onto the native `<dialog>`; `classes.root` a typed no-op) and `disableEnforceFocus` (typed no-op; the native `<dialog>` traps focus).
- **`StyledTabs`** — `onChange` is now a method-signature member so its `value` parameter is bivariant (MUI parity), letting consumers type the handler's value as `string`/enum despite `TabValue` being `unknown` — without `any`.
