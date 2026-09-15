---
'asma-ui-core': minor
---

ASMA-8176: align notification badges with the Figma count and dot variants.

Counts now render `1`–`99`, cap larger values at `99+`, and omit zero even when
legacy `max` or `showZero` props are passed. Visible badge content is hidden from
assistive technology so the host control can expose the real count once, while
the optional `statusMessage` announces later count changes politely without
announcing the initial value.

The new 12px dot uses the stronger Figma border, and the PageHeader notification
action now reuses `StyledBadge`.
