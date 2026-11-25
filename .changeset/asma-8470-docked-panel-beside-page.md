---
'asma-ui-core': patch
---

ASMA-8470: a docked `MinimizableDialogV2` no longer covers the page's toolbar and pager, and a `DynamicToolbar` filter keeps its state when the toolbar changes layout.

The docked panel is non-modal, but at 600 px wide and nearly full height it sat over the right of the page, so the Filter button and the pager under it could not be clicked (Inbox, Outbox and Pathfinders with "New task" or the Pathfinders filter open). While docked, the panel now pads `<body>` by its footprint, so the page lays out beside it. It reserves nothing while minimized or fullscreen, or when the page would be left narrower than 640 px; there it overlays as before. Panels from every ui-core copy on the page are counted, so mixed versions do not fight over the value.

`DynamicToolbar` rendered its `filter` slot at a different place in each layout, so crossing a layout breakpoint (a resize, or the page narrowing beside a docked panel) remounted it and closed an open filter panel or popover. The slot now renders once and moves between layouts, and focus inside it is kept.
