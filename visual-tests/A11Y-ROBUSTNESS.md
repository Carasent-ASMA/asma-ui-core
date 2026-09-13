# Zoom / reflow / text-spacing / target-size / forced-colors audit

ASMA-8140, wave 3c of the ASMA-8132 accessibility epic. Covers the robustness criteria
that no automated rule in this repo checks today.

Measured against `origin/master` at `0915bcdd` with a clean tree, Chromium 1.60.0,
Storybook 10.3.3, 327 stories. Every number below is a measurement, not an estimate.
The gate that keeps them honest is [`a11y-robustness.spec.ts`](./a11y-robustness.spec.ts).

## Why this is not covered by axe

Verified against the installed `axe-core@4.7.2` rather than assumed. ASMA-8136 reached
the same conclusions independently and records them in `docs/a11y-allowlist.md`, which
arrives with PR #171 (not yet on master, so it is named here rather than linked):

- **SC 2.5.8 target size** — the `target-size` rule exists but ships **disabled by
  default** (one of six such rules). Touch-target size is not gated anywhere else, so
  this ticket is the only coverage in the epic.
- **SC 1.4.10 reflow** — **zero** axe rules are tagged `wcag1410`. Not automatable there.
- **SC 1.4.12 text spacing** — `avoid-inline-spacing` is enabled, but it only checks that
  author `!important` inline spacing cannot be overridden. It does not detect the
  resulting clipping.
- **SC 1.4.4 resize text** — no rendered-state rule; `meta-viewport` only catches a
  zoom-blocking viewport tag.
- **forced-colors** — no axe coverage at all.

A green axe job means "no automatically detectable violations of 99 rules". It is a
regression gate, not a conformance claim.

## Summary

All five rows are WCAG 2.2 **Level AA** except forced-colors, which is not a success
criterion at all — it is a platform behaviour whose failures land on 1.4.1 (A) and
1.4.11 (AA). Levels stated explicitly because this file will be read as a conformance
record.

| Criterion | Level | Verdict | Defects found |
| --- | --- | --- | --- |
| 1.4.10 Reflow @ 320 CSS px | AA (2.1) | **Pass** | 0 |
| 1.4.12 Text Spacing | AA (2.1) | Fail | 3 (F-05, F-06, F-07) |
| 1.4.4 Resize Text 200% | AA (2.0) | Fail | 1 (F-08), 2 accepted by design |
| 2.5.8 Target Size (Minimum) | AA (2.2) | Fail | 4 (F-01 … F-04) |
| forced-colors (High Contrast) | n/a — see 1.4.1 / 1.4.11 | **Fail, all three custom controls** | 3 (F-09, F-10, F-11) |

Note on 2.5.8: it is **Target Size (Minimum), Level AA**, new in WCAG 2.2. Not to be
confused with 2.5.5 Target Size (Enhanced), which is AAA and requires 44px. Everything
below is measured against the 24px AA threshold.

Nothing here was fixed. Per the coordinator's wave-3 ruling, component geometry and paint
are design decisions; this ticket measures, gates and documents them. Each finding names
the file to change so the follow-up is a small diff.

---

## SC 1.4.10 Reflow (AA) — passes

At a 320x640 viewport, 108 of 327 stories scroll horizontally. **All 108 are explained,
and none is a component defect:**

- **49** are Storybook artifacts — the story renders a fixed-width wrapper. `PageHeader`'s
  own `MinimumWidth320` story is the clearest case: `Frame width={320}` plus
  `layout: 'padded'` measures `scrollWidth` 368 in a 320px viewport. The component is
  fine; the frame cannot fit.
- **59** contain a data table or grid, the explicit "content requiring two-dimensional
  layout for usage or meaning" exception in SC 1.4.10.
- **0** unexplained.

**Consequence for the gate:** a library-wide reflow sweep is not usable — it would be 49
false positives from story frames. `REFLOW_FLUID_STORIES` in the spec is therefore a
curated list of fluid key-component stories, which still catches the regression that
matters (a component acquiring a fixed `min-width` or a `nowrap` row).

## SC 2.5.8 Target Size (Minimum) (AA)

143 pointer targets measure under 24px in their smaller dimension. Most are conformant
anyway via the **spacing exception**, so raw size is not the finding — these are:

| Component | Size | Count | Status |
| --- | --- | --- | --- |
| `StyledSwitch` track | 38x22 | 32 | exception met (see F-01) |
| Chip delete button | 20x20 | 78 | exception met except F-02 |
| `AIDisclosure` trigger | 16x16 | 5 | exception met |
| Slider range input | 640x16 | 15 | see F-03 |

Two measurement notes, both of which change the answer:

1. **A visually-hidden input is not the target.** `StyledCheckbox` renders
   `input.sr-only` at 1x1 inside a 40x40 `label`. Measuring the input reports 96 phantom
   failures (60 checkbox + 36 radio); measuring the wrapper the click lands on reports
   none. The probe resolves sub-2px boxes to that wrapper.
2. **Undersized is not failing.** SC 2.5.8 excuses a small target when a 24px-diameter
   circle centred on it reaches neither another target's box nor another undersized
   target's circle. The probe implements that geometry.

### F-01 — `StyledSwitch` is 38x22, 2px short, and conforms only by accident

`src/components/inputs/switch/base-ui/StyledSwitch.module.scss`

The track is `--switch-w: 38px` / `--switch-h: 22px`. It passes SC 2.5.8 today **only**
because its `margin: 6px` keeps neighbours outside the 24px circle. That margin is
styling, not contract: any consumer that packs switches tighter, or overrides the margin,
silently drops below the criterion. 32 instances across the library.

Design call: grow the track to 24px, or keep 22px and make the 6px margin a documented,
tested part of the component contract.

### F-02 — Chip delete button (20x20) collides with the field clear button

`src/components/data-display/chip/` (delete button `h-5 w-5`)

20x20, normally saved by the spacing exception. It genuinely fails in
`inputs-styled-select-autocomplete--performance-multiple-chips`, where a chip's delete
button sits within 12px of the field's `autocomplete-clear` button — two adjacent targets,
both reachable by the wrong one. 2 confirmed instances; the pattern recurs wherever a
chip row abuts a field affordance.

### F-03 — Slider thumbs measure 16px (low confidence, needs design input)

`src/components/inputs/slider/StyledSlider.module.scss`

`input[type=range]` measures 640x16 (600x16 horizontal, 16x560 vertical). In
`inputs-styled-slider--params-matrix` the two-thumb range renders two overlapping inputs
whose centres coincide (distance 0), so the spacing exception cannot apply.

Flagged as low confidence on purpose: the measured box is the whole track, while the
*target* a user aims at is the thumb, which the DOM does not expose separately. The 16px
cross-axis is real and worth a design decision, but the "distance 0" clash is an artifact
of the two-input range pattern, not two independently aimable targets.

### F-04 — The table's drifted checkbox copy collapses to 15x15

`src/table/shared-components/StyledCheckbox.module.scss`,
`src/table/components/StyledTable.module.scss`

In `data-display-styledtable--sizing-persistence-and-control-alignment`, **62** targets
fail including the spacing exception:

- table checkbox `_HideWrapper_` — **15x15** (the core control is 40x40)
- `div[role=checkbox]` `_select-control_` — **27x15**
- `div[role=button]` `_show-table-header_` — **10x32**

This is the same drifted-geometry family as **ASMA-8137**: the table keeps its own copies
of core primitives, and they have diverged. The core checkbox is conformant; the copy is
not. Recommend folding this into ASMA-8137 rather than filing separately — same files,
same design sign-off.

## SC 1.4.12 Text Spacing (AA)

Applying the four required declarations (`line-height: 1.5`, `letter-spacing: 0.12em`,
`word-spacing: 0.16em`, paragraph `margin-bottom: 2em`) newly clips text in 8 stories.

### F-05 — `PathfinderCard` compact row clips up to 275px

`src/components/custom/pathfinder-card/Pathfinder.module.scss` (`.compactItems`)

The collapsed metadata row is a single `nowrap` line with `overflow: hidden`. The
overrides push **93px to 275px** of it out of view — with no ellipsis and no expand
affordance, so the hidden text is simply gone. Worst case:
`datadisplay-pathfinder-card--breakpoint-matrix-with-avatar`, +275px. 12 newly-clipped
elements in the collapsed story alone. **The clearest, highest-impact 1.4.12 defect.**

### F-06 — `StyledDynamicSelect` option labels and table date cells

`src/components/inputs/dynamic-select/` (`min-w-0 truncate`),
`src/table/components/StyledTable.module.scss`

Option labels lose a further 6–100px; the table's `14.07.2026 · 14:21` cell loses 10px in
a 150px column. 22 newly-clipped elements. Truncation here is by design, but the
overrides make it eat real content with no full-text affordance on the option row.

### F-07 — The ticket's stated hypothesis does not reproduce

The ticket asked to "watch fixed 40px field heights pinned inline in `field-styles.ts`".
**Measured: those are not the 1.4.12 problem.** No field story clips under the overrides.

`singleLineInputLayoutStyle` pins `lineHeight: '24px'` at `fontSize: 16`, and 24px is
exactly 1.5 x 16px — so the SC's `line-height: 1.5` override is a **no-op** for the input
text. The 40px box is not the risk the ticket expected it to be.

The real field defect is adjacent but different, and surfaces under 1.4.4 rather than
1.4.12 — see F-08. Recording this explicitly so nobody re-audits the 40px heights.

## SC 1.4.4 Resize Text (AA) — at 200%

64 stories newly clip text at a 32px root font-size.

### F-08 — The floating label's line box is pinned in px while its text scales

`src/components/inputs/field-styles.ts` — `floatingLabelClass`

The label sets `leading-[23px]` when resting and `leading-[16px]` when shrunk — **fixed
pixel line-heights** — while its `text-base` / `text-xs` font-size scales with the root.
At 200% the glyphs overflow their own line box by **6–7px** vertically, and
`max-w-[calc(100%-1.75rem)] truncate` takes up to **116px** off the end.

Measured: `inputs-inputfield--default` label `+7y`, client box 80x23, 12 newly-clipped
elements; `form-inputs--form-inputs` `+116x` on "Not filled - only label";
`searchfield--prefilled` `+6y`. Affects every field with a floating label — InputField,
SearchField, Select, and the `form-inputs` composition.

Fix shape: express the label's leading as a unitless ratio or `em` so it tracks
font-size, which also removes the coupling to the pinned 40px shell.

### Accepted by design (not defects)

- `PageHeader` `h1.line-clamp-2` clips one extra line at 200% (`+56y`, up to `+224y` on
  the long-title story). The clamp is intentional and the full string stays available as
  the accessible name plus a `title` tooltip once measured as truncating, so no content is
  lost. Excluded from the 1.4.4 gate for that reason.
- `MinimizableDialogV2` title `line-clamp-1` behaves the same way (`+64y`, 7 stories).

## forced-colors (Windows High Contrast)

The library contains **zero** `forced-colors` / `prefers-contrast` / `-ms-high-contrast`
rules (the only matches in the tree are two unrelated `Introduction.mdx` code samples).
All three custom-drawn controls carry state in properties that forced-colors rewrites, so
none of them adapts.

One correction to the ticket text: it attributes this to "custom visuals with `!important`
SCSS". The checkbox, radio and switch modules use **no** `!important` at all — they draw
from CSS custom properties. The `!important` concentration in this repo is in the datetime
date-picker/time-picker modules and the duplicated datetime `StyledButton`. The mechanism
is forced-colors overriding `color` / `background-color` / `border-color` and dropping
`box-shadow`, not specificity.

Measured with Chromium `forced-colors: active` emulation, light scheme:

### F-09 — Checkbox: the state **inverts** (most severe finding in this ticket)

`src/components/inputs/checkbox/base-ui/StyledCheckbox.module.scss`

`.Indicator { color: transparent }` is how the tick is hidden when unchecked, and
`color: white` is how it is shown when checked. forced-colors overrides `color` to
`CanvasText` in both cases:

| | normal | forced-colors |
| --- | --- | --- |
| unchecked indicator | `rgba(0, 0, 0, 0)` (invisible) | **`rgb(0, 0, 0)`** |
| checked indicator | `rgb(255, 255, 255)` | **`rgb(0, 0, 0)`** |

Identical. **Every checkbox paints a black tick in High Contrast mode, so every checkbox
reads as checked.** This is worse than losing the checked state — it reports the opposite
of the truth. Hiding by `color: transparent` cannot survive forced-colors; the tick has to
be removed from the box or hidden with a property forced-colors does not override.

### F-10 — Switch: on and off are indistinguishable

`src/components/inputs/switch/base-ui/StyledSwitch.module.scss`

The track carries state purely as `background-color`, with `border: none`:

| | normal | forced-colors |
| --- | --- | --- |
| checked track | `rgb(0, 124, 181)` | **`rgb(255, 255, 255)`** |
| unchecked track | `rgb(162, 172, 187)` | **`rgb(255, 255, 255)`** |

Both white, `border-width: 0px`, and the thumb is white on a white track. Additionally the
read-only and error states are drawn with `box-shadow`, which forced-colors drops
entirely, so those states vanish too.

### F-11 — Radio: the checked dot is white on white

`src/components/inputs/radio-button/base-ui/StyledRadio.module.scss`

The dot is a `background-color` on `.Indicator`; forced-colors rewrites it to `Canvas`, so
checked measures `rgb(255, 255, 255)` inside a white circle. Only `opacity` still differs
between states (1 vs 0), and opacity alone paints nothing visible.

### Recommendation

Do **not** record "not supported" in the README. F-09 is not a missing enhancement — the
control actively misreports its state in a mode that shipped Windows users rely on.

The criteria that carry this are **1.4.1 Use of Color (Level A)** — the state is conveyed
by colour alone, so replacing the palette destroys the information — and **1.4.11
Non-text Contrast (Level AA)** — the tick and the switch thumb are graphical objects
required to understand state, and white-on-white is 1:1 against 3:1 required.

Deliberately *not* citing 4.1.2 Name, Role, Value: the programmatic state stays correct
throughout (native `:checked` / `aria-checked` are unaffected), so a screen reader reads
these controls correctly. The defect is purely visual, which is why no ARIA-oriented check
catches it.

The three fixes are small and self-contained:

```scss
@media (forced-colors: active) {
    /* paint state with a property forced-colors preserves */
    .Checkbox { forced-color-adjust: none; } /* or gate the tick on :checked, not colour */
    .switch[data-checked] { outline: 3px solid CanvasText; }
    .Indicator { background-color: CanvasText; }
}
```

Note that `forced-color-adjust: none` is a last resort — it opts out of the OS palette
rather than adapting. The spec has a live gate asserting the library sets it **nowhere**
today, so any future use is a deliberate, reviewed choice rather than a silent regression.

---

## Follow-up tickets to file

| Ref | Finding | Suggested home |
| --- | --- | --- |
| F-09, F-10, F-11 | forced-colors support for checkbox / radio / switch | new ticket, design + a11y |
| F-08 | field floating-label leading is px, not relative | new ticket, small diff |
| F-05, F-06 | PathfinderCard compact row and truncating labels clip under 1.4.12 | new ticket, design |
| F-04 | table's drifted checkbox / row controls under 24px | fold into **ASMA-8137** |
| F-01, F-02 | switch 38x22, chip delete 20x20 | new ticket, design |
| F-03 | slider thumb target size | new ticket, design, low confidence |

## Running this suite

Rides the existing `vrt` CI job — `scripts/vrt.sh check` runs
`playwright test -c visual-tests`, whose `testDir` is `.`, so the spec is collected with
no workflow change. It takes **no screenshots**, so it adds no baselines and is unaffected
by `vrt.sh accept`.

```bash
pnpm build-storybook
VRT_CONTAINER=1 pnpm exec playwright test -c visual-tests a11y-robustness
```

`VRT_CONTAINER=1` is required because `playwright.config.ts` refuses to run outside the
pinned container, to stop macOS pixels polluting Linux baselines. This suite captures no
pixels, so there is nothing to pollute.

To confirm a documented defect still reproduces, force the `fixme` tests to run:

```bash
sed 's/test\.fixme(/test(/g' visual-tests/a11y-robustness.spec.ts > visual-tests/tmp.spec.ts
VRT_CONTAINER=1 pnpm exec playwright test -c visual-tests tmp && rm visual-tests/tmp.spec.ts
```

## A trap worth knowing

`test.use({ forcedColors: 'active' })` **does not work in this project.**
`playwright.config.ts` sets `use.contextOptions`, which replaces the emulation options
Playwright would derive from the fixture, so the media query stays inactive and a
forced-colors test passes while measuring ordinary colours. This bit during development:
all three forced-colors tests passed against components that are definitely broken.

The spec emulates per page with `page.emulateMedia({ forcedColors: 'active' })` and then
**asserts the emulation took** before measuring anything. Keep that assertion — without it
these tests can silently prove nothing.
