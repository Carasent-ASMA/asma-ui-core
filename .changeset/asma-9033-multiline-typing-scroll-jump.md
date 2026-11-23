---
'asma-ui-core': patch
---

ASMA-9033: typing in a tall auto-growing text field no longer moves the page. This covers `StyledInputField multiline` and `StyledTextarea`.

To measure its content, the field collapses to `height: auto` on every keystroke. On a field taller than the screen, that collapse shortened the page for a moment. The browser then pulled the scroll position up to fit the shorter page, so the caret jumped from mid-screen to the screen edge. The field's container now keeps its height while the field is measured, so the scroll position stays where the user left it. If the caret is off-screen, typing still scrolls it into view, as before.
