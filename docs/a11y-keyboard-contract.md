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

Two traps the harness now guards, both of which produced a *wrong answer* before being fixed:

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

11 defects, all reproduced against current `master`.

| ID | SC | Component | Defect |
| --- | --- | --- | --- |
| A | 4.1.2 | `inputs/select/StyledSelect.tsx` | `aria-controls` on the trigger dangles |
| B | 2.4.7 | `inputs/select/StyledSelectItem.tsx` | Focused option paints no focus indicator |
| C | 2.4.3 | `feedback/dialog/StyledDialog.tsx` | Focus is not restored to the opener on close |
| D | 4.1.2 | `feedback/dialog/StyledDialog.tsx` | Dialog is named by its test hook |
| E | 2.4.3 | `utils/popover/StyledPopover.tsx` | Menu close drops focus to `<body>` |
| F | 2.4.7 | `navigation/menu/StyledMenuItem.tsx` | Focused menu item paints no focus indicator |
| G | 2.1.1 | `inputs/select-autocomplete/StyledSelectAutocomplete.tsx` | Clear button is mouse-only |
| H | 2.1.1 | `inputs/select-autocomplete/StyledSelectAutocomplete.tsx` | Popup indicator is mouse-only |
| I | 4.1.3 | `feedback/snack-bar/StyledSnackbar.tsx` | Bare `message` toast is not a live region |
| J | 2.1.1 | `datetime/.../time-picker/TimePickerInput.tsx` | Time panel cannot be opened by keyboard |
| K | 1.4.13, 2.1.2 | `datetime/.../time-picker/StyledTimePicker.tsx` | Escape does not close the time panel |

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

- `StyledDrawer`, `StyledAccordion` and the minimizable-dialog stack have no suite yet.
- The table row-selection keyboard model is a known gap. ASMA-8134 named a keyboard/selection
  interaction test as the precondition for adopting the checkbox `decorative` prop, which is what
  would clear the `nested-interactive` axe violation recorded in
  [`a11y-allowlist.md`](./a11y-allowlist.md). Tracked there; not written here.
- Focus indicator **contrast** (1.4.11) and **size** (2.4.13, AAA) are not asserted here — see the
  criteria table above for who owns what. This suite answers 2.4.7 and 2.4.11 only.
