---
'asma-ui-core': patch
---

`StyledSelectAutocomplete` lists every option on desktop too (long-lists pattern LIST-4), and so do `StyledDynamicSelect`, `StyledEmojiChoice` and `StyledSlider`, which build on it. The desktop list stopped at 100 rows, which hid every later option from scrolling and the keyboard with nothing to say so; the phone picker already listed every option (ASMA-9087). The first 100 rows still come with each keystroke and the rest once typing pauses, so typing stays quick in a long list; End, the arrow keys and opening at a chosen option reach every option.
