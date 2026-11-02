---
'asma-ui-core': minor
---

ASMA-8620: new `StyledEmojiChoice` for the emoji question in Ad Voca and Ad Opus forms
(Figma Questionnaires "emodji + text", node `14961:181796`).

- Up to 5 options are a radio list. Each option is one card: a radio, an 88px emoji in
  a 100px slot and 16/24 text. The whole card is clickable, and the text wraps under
  the radio and emoji when the column is narrow.
- More than 5 options are a dropdown with the same cards. It opens as a full-screen
  picker on a phone.
- `readOnly` shows the answer (or "No answer") with "Show all options (N)". In English
  and Norwegian through `locale`.

`StyledSelectAutocomplete` gets `maxListHeight` (default 320, unchanged). A
`decorative` `StyledRadio` no longer draws its hover halo, because the widget around it
draws the hover.
