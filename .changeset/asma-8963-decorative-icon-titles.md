---
'asma-ui-core': patch
---

fix: ASMA-8963 `CallIcon`, `CheckReadIcon`, `EditNotesIcon`, `HistoryToggleOffIcon`, `HubIcon`, `HubIconFilled`, `MoveUpIcon`, `WidgetIcon` and `WidgetIconFilled` no longer add their component name to the accessible name of the link or button they sit in (a link read "HubIcon Min plan"). WCAG 1.1.1 / 2.5.3.

- Without a name the icon is decorative: `aria-hidden="true"`, `focusable="false"`, no `<title>`.
- To name an icon that stands alone, pass a translated `title` (rendered as the SVG `<title>`) or `aria-label`; the icon then gets `role="img"`.
- An icon-only button keeps its name from its own `aria-label`, as before. A test that found one of these icons with `getByTitle('HubIcon')` (or another hard-coded title) no longer finds it.
