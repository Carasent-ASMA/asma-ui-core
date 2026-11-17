---
'asma-ui-core': patch
---

ASMA-8782: a single-line field ends a value too long for it with an ellipsis instead of
cutting it mid-letter, so a long option in a select (for example an SMS template category)
reads as shortened. While the field is focused the browser scrolls the text as before.
