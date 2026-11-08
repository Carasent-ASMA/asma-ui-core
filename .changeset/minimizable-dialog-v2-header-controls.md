---
'asma-ui-core': minor
---

`MinimizableDialog` and `MinimizableDialogV2`: Minimize stays in the header in fullscreen, a fullscreen-only dialog shows its exit control disabled rather than hidden, and `handleFullScreenState` is told which state was asked for.

Minimize was taken out of the header while the dialog was fullscreen, so a dialog the user had sent fullscreen could be closed but not parked; both versions now offer it in either state, and minimizing drops out of fullscreen into the docked bar. The new `fullscreenLockedReason` prop covers a dialog that only ever runs fullscreen: while it is set, the fullscreen toggle is shown soft-disabled with that reason — in place, focusable, `aria-disabled`, with the reason on hover, focus and tap — instead of being removed from the header, and in V2 the backdrop stops being a way around it. The reason is app-owned and localized; leaving the prop unset keeps today's behaviour.

`handleFullScreenState` now receives the fullscreen state being requested, matching `handleMinimizedState`. Existing zero-argument toggles keep working unchanged, in types and at runtime.
