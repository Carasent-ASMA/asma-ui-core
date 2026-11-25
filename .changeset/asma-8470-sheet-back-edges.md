---
'asma-ui-core': patch
---

ASMA-8470: a `StyledBottomSheet` that is closing no longer swallows taps, and `PopoverSheet` registers a real Back owner on mobile.

After Back or ✕ the sheet stayed a modal `<dialog>` for its 200 ms slide-out, so the page underneath was inert and a tap in that window did nothing. It now drops to a non-modal, pointer-transparent dialog as the exit starts, and goes back to modal if it reopens meanwhile. On mobile `PopoverSheet` passed a ref that was only attached in the desktop branch, so its Back entry had no owner element; the sheet now fills that ref with its root `<dialog>`, which Back nesting and the covered-by-modal filter rely on.
