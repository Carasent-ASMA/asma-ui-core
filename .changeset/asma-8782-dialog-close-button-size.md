---
'asma-ui-core': minor
---

ASMA-8782: `StyledDialog` takes `closeButtonSize`. `small` (default) keeps today's 32px Close; `medium`
is the 40px Close with a 16px label and 24px icon. `hideCloseLabelOnMobile` shows only the Close icon
on a phone, with the label kept as its accessible name. No dialog changes until it opts in.
