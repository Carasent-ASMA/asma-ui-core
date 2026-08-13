---
'asma-ui-core': patch
---

Fix snackbars rendering behind an open `StyledDialog` by hosting the notistack stack inside the topmost open modal `<dialog>`. The stack's portal host is a stable node that is re-parented, so a toast raised as a dialog closes survives the dialog. `StyledSnackbar` portals into the same root.
