---
'asma-ui-core': patch
---

ASMA-8183: `PopoverSheet` Action surface now renders at the fixed 400px spec width instead of sizing to its content, and the body keeps the spec 16px padding.

Content-driven sizing made the surface jump while interacting with it — a filter sheet with a combobox opened narrow (the input's `min-width: 60px` drive the whole sheet) and then grew as values were selected. The DS spec ("Sizing and position") fixes the Action width at 400px and the padding at 16px; anything wider belongs in a panel or page. Consumers that pinned their own sheet widths (content wrappers) should drop them when adopting this version.
