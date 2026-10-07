---
'asma-ui-core': minor
---

StyledTimePicker `minTime` (ASMA-8358): hour/minute cells before it are disabled (Figma Time item State=Disabled), a typed earlier time is not committed and reverts on blur without an error, and `getTimeFromValue` no longer mutates the consumer's `value`.
