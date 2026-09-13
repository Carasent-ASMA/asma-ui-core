---
'asma-ui-core': patch
---

fix(dialog): ASMA-8069 keep the StyledDialog paper a flex column for `scroll='body'`

`flex-col` was gated on `scroll === 'paper'`, so a `scroll='body'` paper stayed a flex row and laid
its header bar out beside the content at roughly half width each — squeezing an embedded document
editor (the storage RTF draft/generate dialogs) into the right half of the screen. `scroll` now only
decides where overflow lives, matching MUI's always-column `.MuiDialog-paper`. Locked by the new
`Feedback/Dialog` `BodyScrollFullScreen` story and its VRT baseline.
