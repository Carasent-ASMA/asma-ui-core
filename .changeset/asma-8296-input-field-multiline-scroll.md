---
'asma-ui-core': patch
---

StyledInputField multiline (ASMA-8296): a field capped by `rows` or `maxRows` now scrolls instead of hiding text past the cap. Behaviour change: a `readOnly` multiline field ignores the cap and shows its whole value (`rows`/`minRows` stay a minimum height).
