---
'asma-ui-core': patch
---

ASMA-8338: a checkbox next to a long, wrapping label keeps its 40×40 target, so its round hover
circle no longer turns into an oval. The label is a flex row and the checkbox wrapper could shrink
(to 16×40); it now has `flex-shrink: 0`, like the radio. Covers the table checkbox too.
