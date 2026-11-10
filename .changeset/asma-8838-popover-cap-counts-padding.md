---
'asma-ui-core': patch
---

ASMA-8838: the `StyledPopover` viewport cap now counts the paper's own vertical padding and borders. The paper is `content-box` (preflight is off), so a padded paper capped at the available height still ended below the window by its padding; it now stays inside.
