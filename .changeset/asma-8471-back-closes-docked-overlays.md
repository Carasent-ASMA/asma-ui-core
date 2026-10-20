---
'asma-ui-core': minor
---

ASMA-8471: Back closes the top overlay, including a docked minimizable dialog.

Browser Back closes the top dialog, menu, select, drawer, date picker, or docked panel and leaves the address unchanged. A dialog that is covered by an open native dialog is skipped, including when that dialog was closed by the browser before React unmounted it. `useBackCloses`, `OverlayBackOwnerContext`, `OverlayBackRequestClose` and `UseBackClosesOptions` are exported for app overlays that are not ui-core components.
