---
'asma-ui-core': patch
---

`StyledSelectAutocomplete` opens a long list at the chosen option at once (long-lists pattern LIST-10). When the first chosen option lies past the first 100 rows, every row is drawn before the list shows, so it no longer opens at the top and jumps there 150 ms later; and it no longer scrolls back to the first chosen option after a tick, an untick or a new query. A query that goes back to an earlier one draws the first 100 rows again, and Space keeps the cursor on the option it chose (ASMA-9087).
