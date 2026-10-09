---
'asma-ui-core': patch
---

ASMA-8421: `ClickAwayListener` no longer closes a popup on the same click that opened it. It starts
listening one tick after it mounts, as MUI's version does. Before this, a popup opened by a click,
such as the QNR designer's rule question picker, closed again about 2 ms after it opened.
