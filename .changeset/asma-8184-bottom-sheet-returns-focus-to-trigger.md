---
'asma-ui-core': patch
---

ASMA-8184: the mobile `PopoverSheet` (`StyledBottomSheet`) returns focus to its trigger on close.

The sheet remembered whatever was focused when it opened. Safari never focuses a tapped button, so
inside a `StyledDialog` that was the dialog's scrollable `StyledDialogContent` (`tabIndex={0}`):
closing the filter sheet on an iPhone put focus back there and painted Safari's focus ring along the
top of the dialog body, under the header. `StyledBottomSheet` takes a new optional `triggerRef`, and
`PopoverSheet` passes its trigger, so focus now lands on the Filter button as on desktop (2.4.3).
