---
'asma-ui-core': patch
---

Close frozen-contract (DEC-003) regressions from the MUI removal (ASMA-7573): one visible-rendering bug in `StyledDialog` plus dropped MUI-passthrough prop signatures surfaced by consumer `tsc`. No runtime export or design change; the API-surface snapshot is unaffected.

**Bug — closed `StyledDialog` rendered visibly.** The native `<dialog>` is hidden by the UA rule `dialog:not([open]) { display: none }`, but the element's unconditional `flex flex-col` utility (author origin, and `!important` under ui-core's Tailwind) overrode it — so every *closed* dialog rendered in-flow. In apps this stacked all the always-mounted dialogs (e.g. per-route "unsaved changes" confirmations, the session "you're being logged out" warning) permanently on top of the page. Fixed by gating the display utility on the `[open]` attribute (`open:flex open:flex-col`): a closed dialog now emits no `display` and the UA rule hides it; `showModal()` sets `[open]` and it renders as a flex column. Robust regardless of host `!important`/`@layer` utilities.

**Type — restored dropped prop signatures:**

- **`StyledDrawer`** — re-add `ModalProps` (`{ keepMounted? }`); typed no-op (the panel stays mounted for the slide transition).
- **`StyledMenuItem`** — re-add `dense`, honored as compact vertical padding.
- **`StyledMenu`** — re-add `slotProps.paper` (`className`/`sx`/`style`), forwarded to the menu paper via `StyledPopover` (whose paper slot now also accepts `style`).
- **`StyledDialog`** — re-add `classes` (`classes.paper` merged onto the native `<dialog>`; `classes.root` a typed no-op) and `disableEnforceFocus` (typed no-op; the native `<dialog>` traps focus).
- **`StyledTabs`** — `onChange` is now a method-signature member so its `value` parameter is bivariant (MUI parity), letting consumers type the handler's value as `string`/enum despite `TabValue` being `unknown` — without `any`.
