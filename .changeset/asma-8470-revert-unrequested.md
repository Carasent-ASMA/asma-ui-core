---
'asma-ui-core': patch
---

ASMA-8470: revert changes the task did not ask for. Escape no longer closes a docked `MinimizableDialog`, `useFocusTrap` handles Escape as before, and the table `pageUrlParam` prop with its `readPageIndexFromUrl` / `useControlledPageUrlParam` exports is removed. The source is back to its state before 3.150.3.
