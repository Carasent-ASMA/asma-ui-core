---
'asma-ui-core': patch
---

ASMA-8782: `StyledDialog` centres the title on the 40px Close when `closeButtonSize='medium'`, as Figma draws it. The title sat 4px above the button's centre because its box was sized for the 32px header row.
