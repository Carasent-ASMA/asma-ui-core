# Keyboard & focus contract

ASMA-8139, wave 3b of the ASMA-8132 accessibility epic.

Every interactive ui-core component has a suite that mounts it in **real Chromium** and drives it
with **real key events**, asserting the keyboard contract its ARIA pattern promises: open/close,
arrow navigation, Home/End, Escape dismissal, focus trap and restore, roving tabindex, the
name/role/value the control exposes, and whether an overlay hides the control that opened it.

| | |
| --- | --- |
| Tests | `src/**/*.interaction.test.tsx` (colocated with each component) |
| Harness | `src/test-utils/renderInteraction.tsx`, `src/test-utils/interaction-api.ts`, `src/test-utils/interaction.setup.ts` |
| Vitest project | `interaction` (see `vite.config.ts` → `test.projects`) |
| Local command | `pnpm test:interaction` |
| CI job | **Keyboard & focus contract (vitest, real Chromium)** in `.github/workflows/interaction-tests.yml` |

Sibling documents, same epic — read together, they describe what CI does and does not check:

- [`a11y-allowlist.md`](./a11y-allowlist.md) — axe violations currently silenced under enforcement (ASMA-8136).
- [`a11y-contrast.md`](./a11y-contrast.md) — per-theme colour contrast findings (ASMA-8138).

## Why this suite exists at all

Storybook's axe job cannot see any of this. axe-core 4.7.2 enforces 99 rules — roughly the
automatable third of WCAG. Keyboard operability, focus order, focus restoration and dismissal are
behavioural properties that only exist while something is being *driven*. A green axe run means "no
automatically detectable violations of 99 rules". It is a regression gate, not a conformance claim.

### The four focus criteria, kept straight

These are easy to conflate, and this epic did conflate them: "SC 2.4.11 focus appearance" — wrong on
both the number and the level — reached three committed documents, this one included, before it was
caught. None of the four is gated by any axe rule; the tags `wcag247`, `wcag1411`, `wcag2411` and
`wcag2413` each match zero of the 99, verified against the installed axe-core rather than assumed.

| SC | Level | Question | Owner |
| --- | --- | --- | --- |
| **2.4.7** Focus Visible | AA | Is there an indicator *at all*? | this suite (findings B, F) |
| **1.4.11** Non-text Contrast | AA | Does the indicator reach 3:1? | ASMA-8138 |
| **2.4.11** Focus Not Obscured (Min) | AA | Is the focused control *visible*, or covered? | this suite (see below) |
| **2.4.13** Focus Appearance | **AAA** | Is the indicator big and thick enough? | **out of scope** — this epic is AA |

The ordering matters for findings B and F: they are **2.4.7** failures first — there is no indicator —
and only become 1.4.11 questions once a ring exists to measure.

## Three decisions worth knowing before you add a test

**No stories.** `visual-tests/stories.spec.ts` screenshots every entry in `storybook-static/index.json`,
and play functions run in the preview iframe on render — the committed
`datetime-datepicker--keyboard-entry.png` baseline shows the post-play typed date, so this is
measured, not assumed. A new story needs a new baseline; a play function on an existing story moves
its pixels. Both make VRT red, and once ASMA-8136 lands, any story whose markup changes must also be
axe-clean. Mounting components directly keeps this suite off both gates.

**Real browser, not jsdom.** Focus traps, roving tabindex, Tab order and `:focus-visible` are what a
DOM emulator approximates worst. Low-fidelity green here would be a fake gate.

**Real key events, not `@testing-library/user-event`.** `userEvent` is re-exported from
`vitest/browser`, not from `storybook/test`. Testing Library's `tab()` computes the next focusable
element itself, in JavaScript, from document order — it walks straight out of a native `<dialog>`'s
focus trap and reports an escape no real user could perform. This cost a false failure during
development before the switch. `expect` still comes from `storybook/test`, for the jest-dom matchers.

Traps the harness now guards, each of which produced a *wrong answer* before being fixed:

- **The viewport is pinned to 1280×720** (matching VRT). `StyledDatePicker` and `StyledTimePicker`
  branch on `useIsMobileView()` (≤768px) into a bottom-sheet `Drawer`, and `StyledDialog` goes
  fullScreen under `(max-width: 743px)`. At the default test-iframe width these suites silently
  exercised the *mobile* component and reported its behaviour as the desktop contract.
- **`outline-none` is a *transparent* outline, not an absent one.** Tailwind compiles it to
  `outline: 2px solid transparent`, so the obvious check — `outline-style !== 'none'` — reports a
  focus ring that cannot be seen. Findings B and F are both this. `describeFocusIndicator` in the
  harness therefore rejects outlines that are transparent or zero-width, and compares the focused
  computed style against the element's own baseline so a background swap counts as an indicator just
  as much as an outline does. Worth knowing beyond this suite: a transparent outline is invisible to
  the naive hand-rolled check *and* to axe, which has no focus-visibility rule at all.
- **The focus starting point is reset between tests.** A real Tab starts from the browser's sequential
  focus navigation starting point, which survives the previous test's unmount and sits on a node that
  no longer exists. In a shuffled run the first Tab of the next test then landed on `<body>` or past
  the end of the page — `StyledTimePicker` "is reachable by Tab" and `StyledAccordion` "reaches the
  panel controls" both failed intermittently in the nightly flaky-test run for this reason. `cleanup()`
  now focuses a throwaway element at the top of `<body>` and removes it, which moves the point back to
  the start.
- **Anchor overlay assertions on a stable inner node**, not the popper wrapper. Poppers that mount
  through a `Fade` churn their outer nodes while the transition settles, so a wrapper query can read
  "gone" for a frame and make an Escape assertion pass for the wrong reason. Finding K below was
  briefly, and wrongly, recorded as working for exactly this reason.

## How a defect is recorded

Wave-3 builders add tests, not component fixes: a contract defect found against real component code
is a design or architecture decision (the class ASMA-8137 was filed to fence off), and three agents
concurrently patching shared components off one base is how an epic gets wrecked.

So a red contract test becomes an `it.skip` carrying a comment that names the success criterion and
the offending file, plus a row below. **A skip in this suite is an open escalation, not a passing
gate.** Every one was verified by un-skipping and confirming it genuinely fails — none is
speculative.

## Findings

The following findings were resolved by ASMA-8087 and are enforced by the `interaction` project.

| ID | Component | Resolution |
| --- | --- | --- |
| A | `inputs/select/StyledSelect.tsx` | Stable listbox IDs; `aria-controls` only while the popup exists |
| B | `inputs/select/StyledSelectItem.tsx` | Trigger-owned active descendant with a visible left indicator |
| C | `feedback/dialog/StyledDialog.tsx` | Restores focus to the connected opener on every close path |
| E | `utils/popover/StyledPopover.tsx` | Returns focus to the anchor on every close path — Escape, outside-press and item activation — whenever the closing panel still owned DOM focus |
| F | `navigation/menu/StyledMenuItem.tsx` | Visible focus indicator on keyboard-focused menu items |
| G | `inputs/select-autocomplete/StyledSelectAutocomplete.tsx` | Empty-input Backspace clears through the combobox trigger |
| I | `feedback/snack-bar/StyledSnackbar.tsx` | Built-in message fallback is an atomic polite status region |
| K | `datetime/.../StyledTimePicker.tsx` | Escape and Tab close the desktop popup without trapping focus |

Resolved after ASMA-8087, also enforced by the `interaction` project:

| ID | Component | Resolution |
| --- | --- | --- |
| D | `feedback/dialog/StyledDialog.tsx` | Named by its visible title, else its label line, else `ariaLabel`, else the first heading in its content; never by `dataTest`. A development-only warning names a dialog that has none of them |

| ID | SC | Component | Status |
| --- | --- | --- | --- |
| J | 2.1.1 | `datetime/.../time-picker/TimePickerInput.tsx` | Deferred: keyboard-open/panel operation |

**L (found during the ASMA-8087 review, 2026-09-17) — WCAG 2.1.2 / 2.4.3, `navigation/menu/StyledMenu.tsx`.**
Tab on an open menu left it on screen and dropped focus to whatever followed the portalled popover in
the tab sequence. The WAI-ARIA Menu pattern makes Tab an exit from the composite widget — "move focus
out of the menu or menubar, and close all menus and submenus" — because every `menuitem` is
`tabindex=-1`, so Tab can never walk the items. `StyledMenu` now closes on Tab without
`preventDefault`, so the browser still performs the move; `StyledPopover` restores the trigger first,
and focus continues from there. Covered for Tab and Shift+Tab.

**M (2026-10-26) — WCAG 2.4.3, `table/components/TableRow.tsx`, `table-header/TableHeader.tsx`.**
Tab walked the table row by row, so leaving a long table took one Tab per row. The rows already keep one
roving tab stop and move with ArrowUp/ArrowDown; the WAI-ARIA Grid pattern makes Tab an exit from the
composite. Tab on a row now moves to the first focusable element after the table, and Shift+Tab goes back
(to the last header control since ASMA-8702, see N below; without one, to the last focusable element before
the table). Covered by `TableRow.keyboard.interaction.test.tsx` (since ASMA-8875 by K-03 / K-11 and K-04 / K-11 in
`TableHeader.keyboard.interaction.test.tsx`).

**N (ASMA-8702, 2026-11) — WCAG 2.1.1 / 2.4.3, `table/components/table-header/TableHeader.tsx`, `TableRow.tsx`,
`helpers/headerControls.ts`.** *Its header Tab walk and its `hideHeader` consumer contract are superseded by O
(ASMA-8875): the header is now one tab stop, walked with the arrow keys. Kept below as history.*
The header row was the table's one tab stop (`<tr tabindex="0">`), and the sort buttons and the column settings
pin came after it in the DOM, so no Tab or Shift+Tab sequence reached them (found while testing ASMA-8597). The
header row is no longer a tab stop. Tab moves through the sortable headers and then the pin, in visual order
(the fixed-left headers render first and the fixed-right ones, the pin included, last). Enter and Space on a
header sort it; Enter on the pin opens the column settings, and Tab then reaches Reset columns. The body model
of ASMA-8087 is kept: the rows are one roving tab stop, Up and Down move between them, Enter acts, and Tab
leaves the table forwards. The two halves of the round trip are explicit, because the header controls come
before the rows in the DOM, but the rows' own controls come after them:

- Tab on the **last** header control moves focus to the active body row, the one the user left, instead of the
  next tabbable element in the DOM. A Tab that something already handled (`defaultPrevented`, as the portalled
  popover does) is left alone.
- Shift+Tab from the active body row moves focus to the **last header control**. Without a header control
  (nothing sortable, `headerPin={false}`) Tab goes straight to the active row, and Shift+Tab leaves the table
  backwards.
- Shift+Tab from the footer's row count select goes back into the table at the active row (it used to go to the
  header row, which is not a tab stop any more).
- `hideHeader`: a hidden header has no tab stops. Its sort headers, the pin and the select-all checkbox are not
  tabbable (`tabIndex` -1, set from the table's `meta.hideHeader`), and `getHeaderControls` returns none for it
  (the `thead` carries `data-header-hidden`). The header is **not** `inert` or `aria-hidden`: its column headers and
  `aria-sort` stay in the accessibility tree, which a test checks in Chrome's own accessibility tree. A control a
  consumer puts in a hidden header is the consumer's: it stays a stop, and the focus is never sent to it. **The
  contract (also in the `hideHeader` prop's JSDoc): a hidden header must not contain tab stops of the consumer's
  (a button or link in a header cell), or the consumer gives them `tabIndex={-1}`.** Otherwise Tab reaches them with no
  visible focus. K-09 pins both halves. `meta.hideHeader`, which the table sets so that its own controls can drop their
  tab stops, is `@internal`: apps must not set it.
- **The resize handle is not a tab stop.** Column resizing is on in every table by default (ASMA-8597), and the handle is
  a pointer-only element with no tab index and no key handler: Tab and Shift+Tab walk past it, and a Tab that reaches the
  header row from it is left to the browser. Resizing from the keyboard is ASMA-8694. K-22 pins this with resizing on by
  default and with `enableColumnResizing`.
- "Header control" means a control Tab would stop on now: a tab index of 0 or more, rendered, not `hidden`,
  `visibility: hidden` or inside an `inert` or `hidden` ancestor. A button with `tabindex="-1"` is not one.

**What is unchanged, and not new in ASMA-8702 (ASMA-8087's body model; the same on master `7fe83452`).** *Superseded by O
(ASMA-8875): the rows' controls are no longer tab stops, and K-20 and K-21 now pin the new model.*
Shift+Tab from after a table enters at the active row only when the rows hold no tabbable controls of their own.
With a control in each row (a button, a checkbox), the browser's previous stop is the **last row's control**; Shift+Tab
then walks back through the rows' controls to the active row, and from the row to the last header control, so there is
no trap, but the way back takes one press per control. A focused control inside a row does not move the roving tab
stop, and the row handlers act only on the row itself, so Shift+Tab on a row's control is the browser's. These are
pinned by K-20 and K-21. An end-of-table focus sentinel (or a retarget) that sends Shift+Tab from after the table to
the active row, and tracking the active row from a focused cell control, would change ASMA-8087's body model. ASMA-8702
leaves them as they are (decided with the owner on 2026-11-05, who did not wait for the ASMA-8087 author's review): every
control stays reachable and nothing traps the focus, only the way back is longer. A retarget would be a separate change.

Wide tables get one tab stop per sortable column. Centre headers are column-virtualised, but Tab still reaches
every one in order: focusing a header scrolls it into view, which renders the next ones. Covered by
`TableHeader.keyboard.interaction.test.tsx` (K-01 to K-10, K-13 to K-22; K-11 too since ASMA-8875), and `StyledTable.header.interaction.test.tsx` (ST-11c, K-12), `StyledTable.resetColumns.interaction.test.tsx`
(K-07). The Storybook stories `Table/Keyboard reach` (`KeyboardReach`, `HiddenHeader`, `RowControls`) let a person try the
whole round trip with the keyboard.

The arrow keys also left the focused row off screen (WCAG 2.4.11): `FocusRowsFeature` focused it with
`preventScroll: true` and never scrolled. It now scrolls the row just into view (`block: 'nearest'`),
with a `scroll-margin` that clears the sticky header and the sticky horizontal scrollbar/footer, so a
row is not left under the header on the way up. Covered by `TableRow.scrollIntoView.interaction.test.tsx`.

**O (ASMA-8875, 2026-11) — WCAG 2.1.1 / 2.4.3 / 2.4.7 / 2.4.11 / 4.1.2, `table/helpers/tableKeyboard.ts`,
`tableControls.ts`, `tableTabStops.ts`, `columnReveal.ts`, `rowActionsMenu.ts`, `scrollFocusIntoView.ts`,
`table/hooks/useTableTabStops.ts`, `TableRow.tsx`. Supersedes N's header Tab walk and ASMA-8087's "row controls are browser
tab stops" (K-20, K-21).**
Tab from a body row jumped to after the table, past every control in the row (the select checkbox, the expand chevron,
the ⋮ menu), and Left/Right did nothing; the header was the opposite, one tab stop per sortable column. One rule now holds
for the whole table: **Tab enters and leaves, the arrow keys move inside** (the WAI-ARIA Grid pattern; the table keeps
native table semantics, there is no `role="grid"`).

- **Two tab stops.** The header row and the body's active row. Every control in the header and in the body rows' own
  cells, built in or a consumer's, is `tabindex="-1"` and marked
  `data-table-control`. `useTableTabStops` keeps this with one MutationObserver on the `<table>`; the built-in controls
  render that state themselves, so the first paint has no extra stops. A control someone made `tabIndex={-1}` without the
  marker (the locked select checkbox) is not a control: the arrow keys pass it.
- **The rows the keys move through** are, in visual (DOM) order, the table's own rows (`TableRow`, marked
  `data-table-row`) and the rows of a StyledTable nested in a sub-row (`renderSubRows`), recursively. TanStack sub-rows
  (`getSubRows`) are ordinary rows. The order is the DOM's, so a `hideFooter` table with more rows than the page size is
  walked to its last row. The keys do not use the row API: `row.focusNextRow` and `row.focusPrevRow` keep their meaning (next or previous from the table's focused row).
- **One owner.** The outermost StyledTable handles every navigation key (React's `onKeyDown` on its `<table>`, which runs
  after the controls' own handlers, so `defaultPrevented` still means "the control took it") and owns both tab stops. A
  StyledTable nested in a sub-row gives up its own: its rows join the outermost body's single stop, and its header has none.
  Nesting is decided once, from the DOM, in `useTableTabStops`: only the owner gets the `onKeyDown` and `onContextMenu`
  handlers (React context would not do: a table in a dialog opened from a cell is a React descendant, yet owns itself).
  A nested `TableRow` still renders its own `tabIndex` from its own state; the outermost table corrects it in the same
  task, before paint, with idempotent writes, so the observer settles (a test records no `tabindex` write once it has).
  `TableRow` keeps only Enter and Space on the row itself: Enter is its own table's `onRowClick`, Space selects or expands
  it.
- **Body row.** Right Arrow from the row goes to its first control, then to the next one (no wrap); Left Arrow goes back,
  and from the first control to the row. Up/Down move to the next/previous row from the row or any control in it, Home/End
  to the first/last row; through nested rows alike. Enter on a row opens it; on a control it activates the control. **Space on a row** (AC 4, as the user defined it, 2026-11-16): with a select column it
  ticks or unticks the row's checkbox (a locked row: nothing); with none, it expands or collapses the row, as its chevron
  does; otherwise it does nothing and leaves the key to the browser. Space on a
  control is the control's, once: it toggles the focused checkbox or chevron. The arrow keys never expand or collapse a
  row (AC 5, amended: Space on a row with no checkbox does). A click on a select checkbox focuses it, as a click on the ⋮
  does (the browser's own mousedown focus, so no focus frame), so Space then toggles it back. Tab leaves the outermost table from any row or control; Shift+Tab goes to
  the outermost header row, or out backwards when the header has no stop. A focus by the mouse, nested or not, moves the body's
  stop to that row.
- **Wide tables.** Above 20 centre columns they are virtualised, and only a window of them is in the DOM. Left/Right, in a
  row or the header, still go to the next control in visual order (fixed-left, centre 0…N-1, fixed-right and actions):
  when it sits beyond columns not rendered yet, the table scrolls the nearest of them in (the virtualizer's
  `scrollToIndex`), waits for it to render, and looks again, until it finds a control or none is left in that direction.
  The key is prevented at once and the reveal is asynchronous; a newer key press or a focus elsewhere stops it, and it
  is capped at the number of columns. If the origin unmounted and nothing was found, the focus goes back to the origin's
  column. The header's Home and End count the unrendered columns too. Cells carry `data-column-index` (centre) or
  `data-column-side` (fixed-right and actions); the virtualizer is registered per `<table>`.
- **The context-menu key, or Shift+F10,** on a row or a control in it opens that row's ⋮ menu with the focus on its first
  item (a click with no pointer press count, as Enter on the ⋮ makes). Two paths lead there, alone or both: the keydown,
  and the `contextmenu` event a keyboard starts — Windows sends it on the Menu key's keyup and for Shift+F10, whatever the
  keydown did. "A keyboard started it" is a `PointerEvent` with an empty `pointerType` (Chromium 125+), else a `MouseEvent`
  without the right button; a mouse right-click is never taken. The action is idempotent (an open menu is left as it is),
  so one press opens one menu, and the keyboard's `contextmenu` inside the open ⋮ menu is prevented too, so no browser
  menu opens over ours. A disabled ⋮ only takes the focus and shows its reason; a row without a ⋮ leaves the key and the
  event to the browser. **Proved in this test browser (Chromium, macOS) for the keys and for a simulated Windows
  `contextmenu`; not run on Windows.**
- **Keys left to a control.** Arrow keys, Home and End stay with a focused control that uses them: a text-like input, a
  textarea, a select, contenteditable, a combobox, slider, spinbutton, listbox, tablist, menu or grid, and a popup button
  whose popup is open (`aria-haspopup` with `aria-expanded="true"`, the open ⋮, whose ArrowDown moves into its menu). A
  disclosure's `aria-expanded` alone (the expanded chevron) does not count: the arrows move on from it. A closed
  select-only combobox (a button with `role="combobox"`, StyledSelect) keeps Up/Down/Home/End, which open it, but not
  Left/Right, which it has no use for: they move along the row, as from any control in a cell. A
  key a control already handled (`defaultPrevented`), or one from a portalled menu (React bubbles it to the table, the DOM
  does not), is left alone.
- **Header (AC 9): it works like a row** (the user's decision, 2026-11-16). The header row itself is its one tab stop; its
  controls never are, and nothing remembers which one was used last. Right from the header row goes to its first control,
  then on (no wrap); Left goes back, and from the first control to the header row; Left on the row does nothing. Home/End
  jump to the first/last control. Up and Down do nothing: the header is not linked to the body. Tab from the header row or
  any header control enters the body on the active row (with no rows, out of the table forwards); Shift+Tab from either
  leaves the table backwards, explicitly (the browser's own Shift+Tab from a control would land on the header row). Enter
  and Space still sort, select all, or open the pin; on the header row they do nothing. The header and the body rows share
  one Left/Right path, the wide-table reveal included. A hidden header (`hideHeader`), or one with no control, has no tab
  stop at all, a consumer's control in it included: this replaces N's rule that the consumer gives such a control
  `tabIndex={-1}`. The internal `meta.hideHeader` is gone; nothing needs it.
- **A dialog or popover inside a row or the header ends the table** (`dialog`, `[role="dialog"]`,
  `[role="alertdialog"]`, `[popover]`). `StyledDialog` is a native `<dialog>` rendered in place, so a cell that opens one
  puts it inside the row's DOM: its controls are not the row's (they keep their own tab stops), its keys are not the
  table's (Tab and the arrows stay the dialog's), and a StyledTable in it owns its own two tab stops. A whole table inside
  a dialog is not affected: that dialog is not inside it.
- **The ⋮** is reached with the arrow keys in its row. An `aria-disabled` ⋮ stays focusable and gives its reason
  (DIS-2, DIS-3, unchanged). Tab in its open menu leaves the table, as Tab from the row does. The reason opens when the ⋮
  takes the keyboard focus (the arrows, Shift+F10, the context-menu key) and stays while it has the focus (WCAG 1.4.13);
  Escape closes it with the focus kept on the ⋮, and moving the focus on closes it. It used to close at once: moving to the
  ⋮ scrolled the table a pixel sideways (its fixed-right cell sticks at `right: -1px`), and the reason closes on a scroll;
  a control in a fixed cell no longer scrolls the table sideways (below). A select checkbox's tooltip (`getRowSelectionTooltip`) wraps the checkbox itself, the
  element that takes the focus, so it opens on keyboard focus too (a locked checkbox is not focusable: its reason is
  on hover).
- **Focus visible and not obscured (2.4.7, 2.4.11; AC 11).** One rule for the whole table (the user's feedback,
  2026-11-16): every focus indicator is **3px wide**, and a border of the framed element is part of those 3px on its side —
  it takes the focus colour and 2px go inside — so nothing grey shows next to the focus. No indicator shifts the layout.
  - A focused row frames its own cells: a body row, nested or not, and the header row alike, all four sides on a row of one
    cell. The header cells' 1px top and bottom borders become part of the frame; a body row's line is a background layer
    inside the cell, which the frame covers.
  - A header control (a sort header, the pin, a consumer's control) frames its header cell 3px on every side, the same
    way, with no ring of its own and no header-wide frame (the user's decision, 2026-11-16, dropped the frame `:has()`
    drew around the whole header). A sort header keeps its sort-preview glyph; the pin keeps its changed-layout dot.
  - The expand chevron frames its body cell 3px on every side. The `:has()` that does it follows the cell's own content,
    so a chevron in a table nested in a sub-row frames its own cell, never the sub-row's.
  - The select checkboxes (body and header select-all) show the base-ui checkbox's frame around their 16px box: a 3px
    ring, 26px outer, with a 2px white gap (Figma Focused 11460-105640). Base-ui and the table share it
    (`styles/_checkbox-focus.scss`); base-ui's compiled CSS is byte-identical.
  - The ⋮ keeps its own ring (the `focus-ring('inset')` mixin: its 1px border recoloured, 2px inside).
  - Forced colours: the row and cell frames become a 3px `CanvasText` outline inside; the checkbox frame takes
    `CanvasText` and `Canvas`, as base-ui does.

  A row or control reached with the keys is scrolled just clear of the sticky header, the sticky horizontal scrollbar
  and footer, and the fixed-left and fixed-right columns. A control scrolls its *cell* into view, not itself: a cell
  clips what overflows it, and scrolling the control scrolled the cell's own content (the select checkbox moved 4px
  left and stayed there). A control in a fixed (sticky) cell scrolls its *row* instead: the cell is always in view
  sideways, and scrolling it moved the table a pixel for the ⋮; a row, as wide as the table, never scrolls sideways under
  `nearest`. The bottom margin used to look only at the table's own wrapper, which has no sticky sibling, so it was
  always 0.

Known gaps. While a reveal scrolls a wide table, the focused control may leave the DOM before the next control renders;
the focus then rests on the page for those frames, and a key pressed in that moment does not reach the table. A StyledTable
nested in a sub-row with a *visible* header: its header controls are not reached by the keys, and a consumer's control in
its header (in a hidden one too) keeps its own tab stop; its built-in ones render `tabIndex={-1}` (no app does this: all
hide the nested header, with no controls of their own in it). A consumer's own plain `<table>` in a sub-row is not
walked. A text field in a row keeps every arrow key, so Tab, not an arrow, leaves it.

Covered by `StyledTable.gridKeyboard.interaction.test.tsx` (AC 1 to AC 11, named by number),
`StyledTable.focusLook.interaction.test.tsx` (the AC 11 focus look: 3px per side, no grey border, the checkbox frame,
no layout shift, forced colours),
`StyledTable.subRows.keyboard.interaction.test.tsx` (nested tables in sub-rows, one tab stop, settling, DOM order,
`getSubRows`), `StyledTable.rowSpace.interaction.test.tsx` (Space on a row, a click on a checkbox),
`StyledTable.focusTooltip.interaction.test.tsx` (the reasons on keyboard focus, no sideways scroll for a fixed cell),
`StyledTable.wideKeyboard.interaction.test.tsx` (wide tables), `StyledTable.rowActionsKey.interaction.test.tsx` (the
context-menu key), the rewritten K-01 to K-22 in `TableHeader.keyboard.interaction.test.tsx` (K-11 with K-03 and K-04),
ST-10, ST-11a and ST-11c / K-12 in `StyledTable.header.interaction.test.tsx`,
K-07 in `StyledTable.resetColumns.interaction.test.tsx`, and `RowActionMenu.interaction.test.tsx`. The Storybook stories
`Table/Keyboard reach` (`KeyboardReach`, `HiddenHeader`, `RowControls`, `SubRows`, `WideTable`, `RowMenus`) let a person
try it.

**P (ASMA-8875, UX comment 95823, 2026-11) — WCAG 2.1.1 / 2.4.3 / 2.4.7 / 4.1.2 / 4.1.3, the column settings menu:
`table/components/columns/action-column/components/HeaderActionMenu.tsx`, `ColumnSettingsMenu.tsx`,
`ColumnSettingsItem.tsx`, `columnMenuKeyboard.ts`; `utils/popover/StyledPopover.tsx` (`disableEscapeKeyDown`).**
Columns in the pin's menu could be reordered only with a mouse: dnd-kit had no keyboard sensor, and the drag icon (an
`<svg role="button" tabindex="0">`) sat inside the row's `<label>`, a control nested in a control. The menu now follows the
table's rule, arrows move inside and Tab enters and leaves:

- **Structure.** The list is a `role="menu"` named "Column settings". Each column is an `<li role="none">` holding two
  controls side by side, neither inside the other: its row, the column's checkbox (`role="menuitemcheckbox"`,
  `aria-checked`, `aria-readonly` when it cannot be hidden; its box is drawn only), and its handle, a `<button
  role="menuitem">` named "Reorder <column>" (a `menu` may own only menu items). Both carry `aria-posinset` /
  `aria-setsize`. The handle is drawn where the icon always was, over the row's first 28px, now a 24 x 24px target.
- **Keys.** One roving Tab stop in the list: the row or handle the focus was last on (the first row at first); Tab goes on
  to Reset columns. Up/Down go row to row (wrapping) and Home/End to the first/last row, always to the row, from the row
  or its handle; Right goes from a row to its handle, Left back. Space or Enter on a row shows or hides the column (Space
  on release, as a native checkbox, so the pressed look holds while it is down). Enter or Space on the pin opens the menu
  with the focus on its first row; a click leaves it on the pin.
- **Lifting.** Space or Enter on a handle lifts the column (dnd-kit's `KeyboardSensor` with `sortableKeyboardCoordinates`);
  Up/Down then move it, Space, Enter or Tab drops it and moves the focus to its row, Escape puts it back with the menu left
  open. A fixed column's handle stays focusable (it tells its reason) but lifts nothing, and no column lands on a fixed
  one: it is neither draggable nor droppable (`disabled: { draggable, droppable }`; a plain `disabled: true` left it
  droppable, so the keyboard moved a lifted column over it before the drop refused it), and one collision rule serves the
  pointer and the keyboard. While a column is lifted the popover leaves Escape alone
  (`disableEscapeKeyDown`): Floating UI's dismiss stops the Escape it handles from propagating, so dnd-kit, listening on
  the document, never heard it.
- **Indicators.** The menu items' 3px inset focus bar on a row while the keyboard focus is on the row or its handle, and
  on the row while it is lifted (UX comment 95823: which row you are on). The handle adds Figma's Quaternary icon button
  Focused ring, a 3px inside stroke with radius 4 (its old rule set a colour only, so it showed none). A column
  lifted from the keyboard is raised with the Menus shadow; no separator line marks where it will land (removed at the
  user's request, 2026-11-25: the lifted row itself stands there). Figma draws no drag state, so a mouse drag is not
  raised either: it looks as it always did.
- **Telling.** A polite `role="status"` region in the menu announces picked up, position n of m, dropped and cancelled, in
  the table's language; dnd-kit's own (assertive, English) region is silenced and its instructions, which describe each
  movable handle, are translated. The footer, pinned under the list (the list scrolls, capped at seven rows), shows the
  keys while the keyboard is on a handle: "Space to reorder", then "↑↓ move · Space drop · Esc cancel" (visual only).

Known gaps. Keyboard lifting satisfies 2.1.1, not 2.5.7: a pointer user who cannot drag still has no single-pointer way
to reorder (Move up / Move down, ASMA-8145). Moving a column past a fixed one that is not at an end of the list is not
refused, by the pointer or the keyboard (fixed columns stand at the ends).

Covered by `StyledTable.columnSettingsKeyboard.interaction.test.tsx` (the keys, lifting, dropping, cancelling, fixed
columns, the indicators, the announcements in both languages, the hint, the pinned footer) and
`StyledTable.columnSettingsMenu.interaction.test.tsx` (structure, names, targets, the pointer). The Storybook story
`Data display/StyledTable` → `ColumnSettingsKeyboardReorder` opens the menu from the keyboard and leaves a column lifted.

H was retired as a false escalation: the popup indicator is intentionally out of the tab order; the focused combobox opens the list with Enter, ArrowDown or ArrowUp.

The detailed passages below are retained investigation history. Their former “not fixed” notes are superseded by the resolved table above.

### A — `aria-controls` on the Select trigger points at nothing (4.1.2)

The trigger advertises `aria-controls={listboxId}`, but on the listbox `<ul>` the explicit
`id={listboxId}` is spread **before** `{...getFloatingProps()}`, and Floating UI's `useRole` supplies
its own generated `id`, which therefore wins. Measured: trigger `aria-controls="status-listbox"`
while the `<ul>` renders `id=":r1:"`. AT cannot follow the trigger to its popup. Also an axe
`aria-valid-attr-value` violation, so it is gated by ASMA-8136 as well.

Notable: the trigger does the opposite and documents why — `getReferenceProps()` is spread *first*
there so the local attributes win. The listbox simply did not get the same treatment, which makes
this look like an oversight rather than a decision.

### B, F — Keyboard-focused rows have no visible focus indicator (2.4.7)

`StyledSelectItem` and `StyledMenuItem` are both `outline-none` with no `focus`/`focus-visible` rule,
while their parents move **real DOM focus** onto them with the arrow keys. Measured on a focused
option: `outline: 2px solid rgba(0,0,0,0)` — Tailwind's `outline-none` is a *transparent* outline,
not an absent one — with `box-shadow: none` and a transparent background. A keyboard user driving an
open listbox or menu has no way to see where they are. The selected row's `bg-gama-50` is selection
state, not focus, and does not move with the arrow keys; `hover:bg-delta-50` covers the mouse only.

Fixing this is a visual change to a shared component and will move VRT baselines, so it needs the
same design sign-off as ASMA-8137's geometry items. **Do not fix B or F with `gama-400` before
ASMA-8138's F-07 is resolved** — the cross-link is recorded in
[`a11y-contrast.md`](./a11y-contrast.md) too, so neither of us has to be in the room when someone
picks this up.

Their measurements: `gama-400`, the library-wide focus colour, is **2.73** (default) / **2.24**
(fretex) / **3.15** (greenish) against its background. Only one theme clears the 3:1 that SC 1.4.11
requires, and only by 0.15. **17 declarations** resolve to it — 15 `*-focused-border-color` plus
`--colors-input-active-focus-outline-color` and `--colors-input-active-active-outline-color` — and
none are touched by ASMA-8133's token work. So adding a `gama-400` ring here would join an existing
17-declaration failure rather than create an isolated new one, and would trade "invisible focus
ring" for "focus ring that fails contrast in two of three themes": strictly worse, because it is
less obvious and, again, no gate can see it.

The encouraging part, also from ASMA-8138: greenish already passes at 3.15 with `jade-400`
(`#1ca1a1`), so a shade near that luminance clears all three themes. The fix is more tractable than
the numbers first suggest.

### C — Dialog does not restore focus to whatever opened it (2.4.3)

`StyledDialog` unmounts on close (`if (!open) return null`) rather than calling `close()`. The
platform only restores focus when a modal `<dialog>` is *closed*; removing the node while it holds
focus drops focus to `<body>`. The next Tab then restarts from the top of the document and a screen
reader user loses their place. Reproduces for Escape, the close button and backdrop click alike.

`StyledSelect.handleOpenChange` exists specifically to prevent this for the select listbox, and says
so in its comment — the codebase already treats the behaviour as required.

### D — Dialog is announced by its test hook (4.1.2)

`aria-label={dataTest}`, so a screen reader announces "confirm dialog" or "sms-send-modal dialog" —
an internal identifier — even though the component already receives a human-readable `dialogTitle`
and renders it. Low effort to fix, but it changes an accessible name every consumer's e2e selectors
and announcements may depend on, so it needs routing rather than a drive-by patch.

**Resolved.** The dialog is `aria-labelledby` its visible title, else its label line; else it takes
the new `ariaLabel` prop; else it is labelled by the first heading (`h1`–`h6` or `role="heading"`) its
content renders, so a custom header in `children` still names it. A dialog with none of these stays
unnamed — an internal identifier is worse than no name — and a development-only `console.warn` names
its `dataTest` so the caller can add one. No consumer in asma-modules selected a dialog by the old
name. Covered in `StyledDialog.interaction.test.tsx` and the `NamedByContentHeading` and
`NamedByAriaLabel` stories.

### E — Closing a menu drops focus to `<body>` (2.4.3)

Same shape as C, different owner. `StyledPopover` unmounts the portalled overlay while DOM focus is
still on a `[role="menuitem"]` inside it, and nothing hands focus back to the trigger. The WAI-ARIA
menu-button pattern requires focus to return to the button on Escape. Affects Escape, outside-press
and item activation alike, so every `StyledMenu` consumer.

Scope warning: `StyledPopover` also backs the date-picker calendar and the filter menu, so a
focus-restore change there is broader than it looks.

### G, H — Autocomplete's trailing buttons are mouse-only (2.1.1)

Both are real `<button>`s with accessible names and both are in the tab order — but each is wired
with `onMouseDown` only (`clearValue`, `togglePopupFromIcon`). A `<button>` activated with Enter or
Space fires `click`, never `mousedown`, so a keyboard user can focus both controls and press them to
no effect. The `onMouseDown` choice is deliberate and documented (`preventDefault` stops the input
blurring before the handler runs) but has no keyboard counterpart — the classic "looks focusable,
does nothing" trap.

Severity is reduced, not removed: clearing is also reachable by selecting the text and deleting it,
and the popup also opens with ArrowDown on the input.

### I — The bare-`message` snackbar announces nothing (4.1.3)

When `StyledSnackbar` renders its built-in pill — the `message`/`action` fallback, used whenever a
consumer does not pass a `children` element that is itself a live region — the markup is a plain
portalled `<div>` chain with no `role="status"`, `role="alert"` or `aria-live`. The text appears
without focus moving, so a screen-reader user is never told. Confirmed by grep: the only `aria-live`
attributes in `src/` are in `ToolbarRows.tsx` and `StyledTextarea.tsx`.

`StyledAlert` (`role="alert"`) and `StyledDefaultSnackbar` (`role="alert"`, the notistack path most
consumers use) are **fine**. This is specifically the positioning primitive's fallback — which is
also the shape MUI-compat call sites port to first. The fix is close to one line, but choosing
assertive vs polite is a product decision.

### J, K — The time-picker panel is keyboard-inaccessible and undismissable (2.1.1, 1.4.13, 2.1.2)

**J:** the panel can only be opened with a pointer. The field wrapper uses
`slotProps.input.onMouseDown`, and the trailing clock is a bare `<ClockOutlineIcon>` — an `<svg>`
with an `onClick`, not a button, no `tabindex`, no key handler — so it never receives Enter/Space.
There is no ArrowDown-to-open on the input either, unlike `StyledSelect` and
`StyledSelectAutocomplete`.

**K:** once opened with the mouse, Escape does not close it. Dismissal is a
`ClickAwayListener mouseEvent='onMouseDown'` plus `useBackNavigationClose` on mobile;
`usePopupState` registers no key handler. Every other overlay in the library — `StyledPopover`,
`StyledSelect`, `StyledSelectAutocomplete`, `StyledTooltip`, `StyledDialog` — closes on Escape, so
this is an inconsistency as well as a defect. (Note the mobile `Drawer` branch *does* handle Escape;
only the desktop popper is affected, which is why the pinned viewport matters.)

J is mitigated by the typed path: a keyboard user can set a time by typing `HHMM`, which is asserted
and passing, so the function is operable and this is not a total 2.1.1 block. What is unreachable is
the panel itself — its eraser, its confirm button, its "now" affordance — so keyboard and pointer
users get materially different capabilities.

## Disabled controls stay focusable

The ASMA [disabled-states pattern](https://github.com/Carasent-ASMA/asma-modules/blob/master/_docs/ux/patterns/pattern-disabled-states.md)
(approved 2026-09-29) requires a disabled action to stay focusable with `aria-disabled`, give its
reason on hover, focus and tap, and do nothing when activated (DIS-2, DIS-3, DIS-4); a running action
is busy, not removed from the Tab order (DIS-8). WCAG 2.1.1 does not require either way — a disabled
control has no function to operate — so this is the rule that decides, and it follows the WAI-ARIA
APG, which keeps disabled menu items, tabs, listbox options and toolbar buttons focusable so
screen-reader users can find them. Native `disabled` is kept only on `StyledButton` itself, which
leaves the choice to its caller.

| Component | Disabled behaviour | Covered by |
| --- | --- | --- |
| `inputs/button/StyledButton` | `[aria-disabled="true"]` gets the same disabled tokens and not-allowed cursor as `:disabled`, with no hover | story `AriaDisabled` |
| `feedback/dialog/.../StyledDialogFooter` | `disabled` and `loading` render `aria-disabled` (plus `aria-busy` when loading); the click is blocked, including a form submit; the `tooltip` opens on focus | `StyledDialogFooter.test.tsx`, stories `DisabledPrimaryExplainsItself`, `PrimaryLoading` |
| `custom/module/header-layout/ToolbarActionButton` | `aria-disabled`, click blocked | `ToolbarActionGroup.interaction.test.tsx`, story `DisabledActionFocusable` |
| `navigation/menu/StyledMenuList` | Arrow keys, Home and End visit disabled items; opening still focuses the first enabled item; `StyledMenuItem` refuses Enter and Space. Roving tabindex keeps exactly one item — the focused one, else the first enabled — in the Tab order, so a scrolling (7.5-row capped) menu has a keyboard-reachable stop | `StyledMenu.interaction.test.tsx`, stories `DisabledItemReachable`, `ScrollableMenu` |
| `navigation/tabs/StyledTab` | `aria-disabled`, on the arrow-key path, not selectable; the new `tooltip` prop is its accessible description | `StyledTabs.interaction.test.tsx`, story `DisabledTabWithReason` |
| `data-display/chip/StyledChip` | A disabled chip that would be clickable stays a focusable, `aria-disabled` control; a plain chip is unchanged | `StyledInteractiveChip.interaction.test.tsx`, stories `Checkbox_Disabled`, `DisabledOptionChipGroup` |
| `inputs/select-autocomplete/StyledSelectAutocomplete` | The active-descendant cursor visits disabled options; Enter and Space refuse them; opening still lands on the selected or first enabled option | `StyledSelectAutocomplete.interaction.test.tsx`, story `DisabledOptionAutocomplete` |
| `inputs/dynamic-select/.../DynamicSelectAutocomplete` | A disabled option's `getOptionTooltip` reason is its accessible description and opens while the keyboard is on it | story `DisabledOptionAutocomplete` |
| `table/.../RowActionMenu` | With every action disabled, the ⋮ is `aria-disabled`; its reason opens on hover, focus and tap and closes on leave, blur and Escape; only a touch-opened reason closes itself after 1.6 s | `RowActionMenu.interaction.test.tsx`, story `Table/Row Action Menu › DisabledWithReason` |
| `data-display/tooltip/StyledTooltip` | Describes the first focusable control in its wrapper when nothing is tabbable, so a roving-tabindex item (an unselected tab) is described rather than its wrapper; does not add itself when the control is already described by the same text, so a permanent reason is not read twice | `focusable.interaction.test.tsx`, `StyledTooltip.interaction.test.tsx` |

This reverses one earlier assertion: `StyledInteractiveChip.interaction.test.tsx` had kept a disabled
chip out of the Tab order (ASMA-8087), before the pattern was approved.

## SC 2.4.11 Focus Not Obscured (Minimum) — AA

`StyledSelect.focus-obscured.interaction.test.tsx` covers a criterion nothing else in this epic
checks. It is distinct from the 2.4.7 assertions: those ask whether a focus indicator is *painted*,
this asks whether the focused control is *visible at all* once the component's own overlay is on
screen. A control can have a perfect focus ring and still fail by being covered by the very popup it
opened.

The usual 2.4.11 failure — a focused control scrolled under an app's sticky header — is not
something a component library can be responsible for. What *is* in scope, and what is asserted, is a
library overlay covering its own trigger: the Select listbox over its combobox, the autocomplete
popup over its input, the calendar over the button that opened it, the tooltip over the control it
describes. This matters for ASMA-8080 in particular, which deliberately attached the Select popover
flush to the field (`offset(0)`) — flush is one pixel from overlapping.

Nothing else can see this. axe has no rule for it, and VRT cannot catch it because a baseline
records the obscured state as correct. The check uses `elementFromPoint` (so it respects paint
order, the top layer and `pointer-events`) over a 3×3 grid inset from the element's edges, and the
file includes a self-check that deliberately covers a button and confirms the helper reports it —
without that, a helper regression would leave every assertion in the file passing while measuring
nothing.

All five currently pass.

## Not covered

- The table row-selection keyboard model is a known gap. ASMA-8134 named a keyboard/selection
  interaction test as the precondition for adopting the checkbox `decorative` prop, which is what
  would clear the `nested-interactive` axe violation recorded in
  [`a11y-allowlist.md`](./a11y-allowlist.md). Tracked there; not written here.
- TimePicker keyboard-open/panel operation (finding J) remains deferred to its owning follow-up.
- Focus indicator **contrast** (1.4.11) and **size** (2.4.13, AAA) are not asserted here — see the
  criteria table above for who owns what. This suite answers 2.4.7 and 2.4.11 only.
