---
'asma-ui-core': patch
---

ASMA-8470: Android Back closes a `StyledDialog` even with the host overlay-back flag off.

With the flag off (prod today) `StyledDialog` swallowed the native `cancel` and, on a second Back,
re-showed the force-closed dialog, so Back could never dismiss it. Both the `cancel` and the forced
`close` now ask the registry top to close, as `StyledBottomSheet` already does. Neither path touches
browser history, so the kill switch still fully disables the history adapter.
