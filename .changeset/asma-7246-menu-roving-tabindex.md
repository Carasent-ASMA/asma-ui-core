---
'asma-ui-core': patch
---

`StyledMenuList` keeps exactly one of its items in the Tab order — the one that last held focus, else
the first enabled item — with roving tabindex (WAI-ARIA APG). A menu capped at 7.5 rows scrolls, and a
scrolling region with nothing keyboard-reachable failed axe `scrollable-region-focusable` (the
`Scrollable Menu` story, failing in every nightly run). A popup `StyledMenu` still closes on Tab, so it
gains no Tab stop; a menu list shown in the page is now reachable with Tab.
