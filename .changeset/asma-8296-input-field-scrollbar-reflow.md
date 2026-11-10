---
'asma-ui-core': patch
---

ASMA-8296: an uncapped `StyledInputField multiline` no longer scrolls inside itself when its scroll container shows a classic (space-taking) scrollbar, as on Windows.

To measure, the field collapses to `height: auto`. When the field is what makes a dialog body scroll, that collapse hid the body's scrollbar, so the field was measured wider than it lays out. It came out a line short and scrolled inside itself as well as the body (a double scroll). Below the cap, the field now grows again after measuring instead of scrolling. Fields capped by `maxRows` or `rows` still scroll once they reach the cap.
