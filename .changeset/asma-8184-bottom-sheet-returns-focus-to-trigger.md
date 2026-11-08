---
'asma-ui-core': patch
---

ASMA-8184: closing a `PopoverSheet` with a tap or click returns focus to its trigger without a focus ring.

- The mobile sheet (`StyledBottomSheet`) remembered whatever was focused when it opened. Safari never
  focuses a tapped button, so inside a `StyledDialog` that was the scrollable `StyledDialogContent`:
  closing the filter sheet on an iPhone painted Safari's blue focus ring along the top of the dialog
  body. `StyledBottomSheet` takes a new optional `triggerRef`, and `PopoverSheet` passes its trigger.
- Safari also lets a scripted focus inherit the focus-visible state of the element it leaves, so the
  trigger showed its DS ring after a tap. Both the sheet and the anchored popover now return focus with
  `focusVisible` set from the last input (the `inputModality` tracker `FullScreenPicker` already uses):
  no ring after a tap or click, the ring after a key press such as Escape (2.4.3, 2.4.7).
