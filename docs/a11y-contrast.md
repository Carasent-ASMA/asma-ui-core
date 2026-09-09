# Per-theme colour contrast — findings register

WCAG 2.2 AA, success criteria **1.4.3 Contrast (Minimum)** and **1.4.11 Non-text Contrast**.

**Criterion scope, stated precisely because it is easy to get wrong.** Focus-indicator *contrast*
is covered by **1.4.11 Non-text Contrast (AA)** — 3:1 against adjacent colours — and that is the
criterion cited throughout this file. It is *not* 2.4.11: in WCAG 2.2, **2.4.11 is Focus Not
Obscured (Minimum)** (AA), which is about a focused control being hidden behind sticky headers or
overlays and says nothing about contrast. **Focus Appearance is 2.4.13, and it is AAA** — out of
scope for this epic, which is scoped to AA. Nothing in this register asserts against 2.4.13.
Focus Not Obscured (2.4.11) is a genuine AA criterion that nothing in this epic currently checks;
it is a layout concern rather than a token one, so it does not belong here.

One further distinction this register relies on, because F-15 needs both halves:

- **2.4.7 Focus Visible (AA)** — whether a focus indicator *exists at all*.
- **1.4.11 Non-text Contrast (AA)** — whether the indicator that exists has *enough contrast*.

A dropped declaration fails the first; a washed-out colour fails the second. Neither has an
axe rule.

The gate lives in `src/a11y/contrast/`. It resolves every design token out of the theme CSS and
computes the contrast ratio of the pairs the components actually put on screen, for **every** theme
— `default`, `fretex`, `greenish`.

| | |
| --- | --- |
| Check | `src/a11y/contrast/themeContrast.test.ts` |
| Pair table | `src/a11y/contrast/contrastPairs.ts` |
| Token resolver | `src/a11y/contrast/themeTokens.ts` |
| Contrast maths | `src/a11y/contrast/wcagContrast.ts` |
| Ticket | ASMA-8138, wave 3a of ASMA-8132 |

Related: [`docs/a11y-allowlist.md`](./a11y-allowlist.md) — the axe story baseline from ASMA-8136.
The two are **different instruments and must not be merged**. The allowlist records axe violations
that are currently silenced per story and is burning down to zero. This file records *measured
contrast ratios* that need a design decision. A finding here is not an allowlist entry, and no row
here should ever be copied there.

## Why a separate check rather than relying on axe

- Storybook's axe run only ever renders the **default** theme. Only three story files opt into
  another theme, via `data-theme` on an inner wrapper. `fretex` and `greenish` are effectively
  unmeasured by axe.
- axe-core has **no rule for SC 1.4.11 at all**. Its only contrast rules are `color-contrast`
  (1.4.3, AA) and `color-contrast-enhanced` (AAA, disabled by default). Non-text contrast — control
  borders, state indicators, focus rings — is invisible to it. *(Confirmed against
  `axe._audit.rules` by ASMA-8136.)*
- Resolving the CSS directly covers every theme and both criteria in milliseconds, with no browser.

Ratios here are **truncated** to two decimals, matching axe, so a number in this file is
digit-for-digit comparable with one in the allowlist. Both files independently measure
`--colors-delta-500` on white at **3.55:1**, which is a useful cross-check that the two toolchains
agree.

## Ground rules

1. **This gate never changes a token to go green.** A token value is a visual — potentially
   breaking — change to a brand theme and belongs to ASMA-8133 plus design sign-off, the same class
   of decision as ASMA-8137. A failing pair is quarantined here and escalated, never patched.
2. **Tokens are cited by name, never by line number.** `src/styles/**` is ASMA-8133's area and its
   line numbers move.
3. **Every quarantined pair must appear below.** `themeContrast.test.ts` asserts it: a skipped
   assertion with no write-up fails the suite.
4. **A quarantined pair is still asserted — against a regression floor, not the WCAG threshold.**
   The floor is the ratio the pair measures on master (`REGRESSION_FLOORS` in `contrastPairs.ts`).
   The suite goes red if a quarantined pair gets *worse*, and stays green if it legitimately
   *improves*. This is a characterization test: the floor records the status quo, it is not a
   standard. The real target lives in this file, per finding. Lifting a quarantine means deleting
   the pair's `finding` key, and the live SC assertion takes over.
5. The only pairs left as `it.skip` are the ones with **no computable ratio at all** — F-15, where
   the `var()` chain is dangling so the browser drops the declaration outright. A floor is
   meaningless when there is no value to measure.

## Status

| | |
| --- | --- |
| Assertions passing | 329 |
| — of which quarantined, held to a regression floor | 90 |
| Skipped (no computable ratio — F-15 only) | 4 |
| Distinct findings | 15 |
| Themes covered | 3 (`default`, `fretex`, `greenish`) |

Regenerate the floors after any token change:
`npx vitest --project=unit --run src/a11y`

---

## Findings

Each entry: the token, the exact consumer, the resolved hex pair, the measured ratio, and the
criterion with its threshold.

### F-01 — input placeholder / floating label is under 4.5:1

`--colors-input-active-placeholder-color` on `--colors-input-active-bg-color`.
Consumer: `src/components/inputs/field-styles.ts`. **SC 1.4.3, needs 4.5:1.**

| Theme | Resolved | Ratio |
| --- | --- | --- |
| default | `#7a899e` on `#ffffff` | **3.55** |
| fretex | `#686868` on `#ffffff` | 5.57 ✅ |
| greenish | `#7a899e` on `#ffffff` | **3.55** |

Root cause is `--colors-delta-500` = `#7a899e`, shared by `default` and `greenish`. This is the same
defect ASMA-8136 measured from the other direction: it accounts for all 13 `StyledInputField`
stories in the axe baseline. One token decision clears both.

### F-02 — error input text on the error tint is under 4.5:1

`--colors-input-error-text-color` (`--colors-error-500`) on `--colors-input-error-bg-color`
(`--colors-error-100`). Consumer: `src/components/inputs/field-styles.ts`.
**SC 1.4.3, needs 4.5:1.** `#e10700` on `#f7dede` = **3.88** in all three themes.

Theme-invariant: the error ramp lives in `rootVariables.css` and no theme overrides it.

### F-03 — filled success alert, white on success-500

`#ffffff` on `--colors-success-500`. Consumer:
`src/components/feedback/snack-bar/StyledAlert.tsx`. **SC 1.4.3, needs 4.5:1.**
`#ffffff` on `#00d651` = **1.95** in all three themes. The worst text finding in the library.

### F-04 — filled info alert, white on info-500

`#ffffff` on `--colors-info-500` = `#0297e8` = **3.18**, all themes. **SC 1.4.3, needs 4.5:1.**
Consumer: `src/components/feedback/snack-bar/StyledAlert.tsx`.

### F-05 — filled warning alert, white on warning-500

`#ffffff` on `--colors-warning-500` = `#f0c800` = **1.61**, all themes. **SC 1.4.3, needs 4.5:1.**
Consumer: `src/components/feedback/snack-bar/StyledAlert.tsx`. White on a saturated yellow is close
to the worst case the criterion exists to catch.

Note the same component's `filled` **error** variant passes at 6.81 and every `standard` and
`outlined` variant passes, so the fix is confined to the three `filled` severities.

### F-06 — fretex collapses the theta ramp to white

`--colors-link-text-standart` on `--colors-theta-700`. Consumer:
`src/components/feedback/snack-bar/processInfoSnackbar.ts` (`bg-theta-700` plus
`!text-[color:var(--colors-link-text-standart)]`). **SC 1.4.3, needs 4.5:1.**

| Theme | Resolved | Ratio |
| --- | --- | --- |
| default | `#ffffff` on `#006696` | 6.28 ✅ |
| fretex | `#7a899e` on `#ffffff` | **3.55** |
| greenish | `#ffffff` on `#0b4040` | 11.52 ✅ |

`fretexTokens.css` sets `--colors-theta-400`, `-500`, `-600`, `-700`, `-800` and `--colors-theta-hover`
all to `#ffffff` — a five-rung ramp flattened to a single value. The component assumes theta-700 is a
dark surface and pairs it with light text; under fretex the surface is white, so the pair inverts and
the text is a mid-grey on white. This is the collapse called out in the ASMA-8138 ticket, now
measured.

### F-07 — the focus ring fails 1.4.11 in two of three themes

`--colors-gama-400` against the page surface. **SC 1.4.11, needs 3:1.**

| Theme | Resolved | Ratio |
| --- | --- | --- |
| default | `#4da6cf` on `#ffffff` | **2.73** |
| fretex | `#9cb2a9` on `#ffffff` | **2.24** |
| greenish | `#1ca1a1` on `#ffffff` | 3.15 ✅ |

The single highest-reach finding in this file — `gama-400` is *the* focus colour library-wide:

- `src/components/inputs/field-styles.ts` — input focus ring
- `src/components/inputs/switch/base-ui/StyledSwitch.module.scss` — switch focus ring
- `src/components/data-display/chip/StyledChip.tsx` — chip focus ring
- `src/components/navigation/link/StyledLink.module.scss` — link focus outline
- `--colors-button-{contained,outlined}-common-focused-border-color` — every button focus border

Only `greenish` clears the bar, and only by 0.15. Worth pairing with ASMA-8139's focus-visible work.

#### Blocks two ASMA-8139 findings — do not fix those with `gama-400`

ASMA-8139 found that `StyledSelectItem` and `StyledMenuItem` paint **no** focus indicator while
arrow-key navigation moves real DOM focus onto them (its findings B and F, in
[`docs/a11y-keyboard-contract.md`](./a11y-keyboard-contract.md)). The obvious remedy is to reach
for the library's standard focus ring — which is `gama-400`, i.e. this finding.

**Fixing B or F with `gama-400` before F-07 is resolved would trade an invisible focus ring for one
that fails SC 1.4.11 in two of three themes** — a strictly less obvious defect, and one no CI gate
can catch: axe has no `wcag1411` rule, and VRT would be green because the baseline records the
failing colour as correct. Recorded on both sides so the coupling does not depend on either author
being in the room when B is picked up.

Related trap from the same investigation, worth knowing for anyone extending this suite to walk
rendered focus styles: **Tailwind's `outline-none` compiles to a *transparent* outline, not an
absent one**, so a naive `outline-style !== 'none'` check reports those rows as focus-visible. This
register is unaffected — it reads token values rather than computed styles — but it applies the
same rule structurally: a `transparent` border is not treated as a boundary (see
`BUTTON_TYPES_WITH_BOUNDARY` and the boundary selection in `themeContrast.test.ts`).

**Scope, counted in the repo rather than estimated.** 15 `*-focused-border-color` declarations
resolve to `--colors-gama-400` — 4 in `defaultTokens.css`, 4 in `jadeTokens.css` and 7 in
`fretexTokens.css` (fretex has three extra because it routes its *error* focus borders through
`gama-400` instead of `beta-400`). Two more reference it outside the button family:
`--colors-input-active-focus-outline-color` and `--colors-input-active-active-outline-color`.

None of those 17 are touched by ASMA-8133's PR #172, which fixes only the six `beta-400`
declarations. They fail 1.4.11 under `default` (2.73) and `fretex` (2.24) and pass under `greenish`
(3.15). **So after #172 lands the library still fails 1.4.11 on its primary focus indicator in two
of three themes, and no CI gate can see it**: axe has no `wcag1411` rule, and VRT is green because
the baselines record the failing colour as correct. This suite is the only thing that reports it.

### F-08 — input hover border is under 3:1

`--colors-input-active-hover-outline-color` (`--colors-gama-300`) on
`--colors-input-active-bg-color`. Consumer: `src/components/inputs/field-styles.ts`.
**SC 1.4.11, needs 3:1.** default `#66b3d6` **2.33** · fretex `#adc6bc` **1.81** · greenish
`#60bdbd` **2.20**. Fails in all three.

### F-09 — switch off-track is under 3:1

`--colors-delta-400` on the page surface. Consumer:
`src/components/inputs/switch/base-ui/StyledSwitch.module.scss`. **SC 1.4.11, needs 3:1.**
default `#a2acbb` **2.29** · fretex `#686868` 5.57 ✅ · greenish `#a2acbb` **2.29**.

The off state is the switch's only boundary, so a user cannot reliably locate an unchecked switch on
a white page in `default` or `greenish`.

### F-10 — switch read-only track ring is under 3:1

`--colors-delta-300` on `--colors-delta-10`. Consumer:
`src/components/inputs/switch/base-ui/StyledSwitch.module.scss`. **SC 1.4.11, needs 3:1.**
default `#bdc4cf` on `#f9fafb` **1.68** · fretex `#b4b4b4` on `#f9fafb` **1.98** · greenish **1.68**.

### F-11 — chip border is under 3:1

`--colors-delta-300` on the page surface. Consumer:
`src/components/data-display/chip/StyledChip.tsx`. **SC 1.4.11, needs 3:1.**
default `#bdc4cf` **1.75** · fretex `#b4b4b4` **2.07** · greenish `#bdc4cf` **1.75**.

Matches ASMA-8136's independent measurement of `--colors-delta-300` at 1.75:1.

### F-12 — button label on its own hover/active tint is under 4.5:1

`--colors-button-{outlined,text,textGray}-common-{hover,active,focused}-text-color` on the matching
`-bg-color`. Consumer: `src/components/inputs/button/StyledButton.module.scss`.
**SC 1.4.3, needs 4.5:1.** Nine combinations × three themes; every one lands between **3.55** and
**4.23**.

The pattern is the same each time: `gama-500` on a `gama-50` or `gama-100` tint. The base state
passes (4.61 / 4.70 / 4.67 on white) and the tint is what pushes it under — so the label goes from
just-compliant to non-compliant precisely when the user interacts with it.

Worst cases: `outlined/common/hover` default `#007cb5` on `#cce6f1` = **3.55**;
`text/common/active` greenish `#168181` on `#c5e7e7` = **3.55**.

### F-13 — outlined button hover/active border is under 3:1

`--colors-button-outlined-common-{hover,active}-border-color` (`--colors-gama-300`) against the page
surface. **SC 1.4.11, needs 3:1.** default `#66b3d6` **2.33** · fretex `#adc6bc` **1.81** · greenish
`#60bdbd` **2.20**. Same `gama-300` root cause as F-08.

### F-15 — the error-button focus border points at a token no theme defines

`--colors-button-{contained,outlined,text}-error-focused-border-color` is declared as
`var(--colors-beta-400)`. **`--colors-beta-400` is defined nowhere.** The beta ramp ships only
`-100`, `-500`, `-600`, `-700`.

A `var()` chain that never reaches a literal is *invalid at computed-value time*: the browser drops
the whole declaration. So under `default` and `greenish` these three buttons render **no focus
border at all** — the failure is not a low ratio, it is a missing focus indicator, so the criterion
it breaks is **SC 2.4.7 Focus Visible (AA)** before contrast is even reachable. Where an indicator
does render, **SC 1.4.11 Non-text Contrast (AA)** applies at 3:1.

That split is the sharpest statement of why a token-level check was the only thing that could catch
this: there was literally nothing in the DOM to measure. A contrast checker needs two colours, and
the browser had discarded one of them.

`fretex` escapes only because it independently overrides all three declarations to
`var(--colors-gama-400)` — where it then lands at **2.24**, i.e. F-07 again.

This is the finding that most justifies a token-level check: no rendered test can see it, because
in the browser the broken declaration simply vanishes.

#### Confirmed from rendered pixels

ASMA-8133 decoded the VRT baseline PNGs and scanned inward from the top edge, which confirms the
consequence empirically rather than by reasoning about the cascade:

| variant | old baseline, scanning inward |
| --- | --- |
| Primary·Danger (contained) | `#ffffff ×5` `#e10700 ×1` `#ffffff ×2` `#e10700 ×10` |
| Secondary·Danger (outlined) | `#ffffff ×6` `#f7dede ×12` |
| Tertiary·Danger (text) | `#ffffff ×5` `#f7dede ×13` |

`contained` shows only its ordinary 1px `#e10700` border, identical to the unfocused state; the
other two show nothing at all. A **missing** focus indicator, not a weak one.

The mechanism for `contained` is worth recording precisely: it applies the focus colour through the
`outline` **shorthand**, and when a shorthand is invalid at computed-value time every longhand
resets to its initial value — and `outline-style`'s initial is `none`. No outline is painted.

#### Remedy in flight — `red-300` fails, `red-700` passes

ASMA-8133's PR #172 originally proposed `var(--colors-red-300)` = `#f6b9b9`. That clears nothing:
**1.67** against the white page, **2.96** against the `#e10700` contained fill, **1.31** against the
`#f7dede` outlined/text fill — identical in all three themes. It would have fixed the dropped
declaration while leaving the indicator failing SC 1.4.11.

**#172 now uses `red-700` `#9d0f0f`, which clears 3:1 on every adjacency.** ASMA-8133 and this
suite reached that shade independently, for the same reason: it is already the shade the sibling
`*-error-active-border-color` uses, so it needs no new token.

The adjacency differs by button type, per the `&:focus` block in `StyledButton.module.scss` and
confirmed against the re-baselined pixels:

- **outlined** and **text** — the ring sits at the button edge, between the white page and the
  `#f7dede` fill. `red-700` measures **8.37** and **6.56**. Pass.
- **contained** — `outline: 2px solid` with `outline-offset: -2px`, plus
  `box-shadow: inset 0 0 0 2px white`. The new baseline scans
  `#ffffff ×5` `#9d0f0f ×2` `#ffffff ×1` `#e10700 ×10`: the ring is sandwiched between the white
  page outside and the white inset ring inside, and **never touches the fill**. So the pair to
  measure is `red-700` against white, twice: **8.37 on both sides**. Pass. The white inset ring is
  in turn **4.96** against the `#e10700` fill, so the composite two-tone indicator is discernible
  end to end.

> **Correction.** An earlier revision of this register concluded that no red shade could work for
> `contained`, and that the ring would need to be near-black (≥14.89:1 against white, e.g.
> `#4a0000`). That solve assumed the coloured ring is adjacent to the `#e10700` fill. The decoded
> baseline shows it is not — the 2px white inset ring separates them. The arithmetic was right for
> the premise; the premise was wrong. `red-700` is sufficient and no near-black is required. Raised
> with ASMA-8133 and the coordinator so the incorrect conclusion is not propagated.

#### What #172 should be recorded as clearing — and what it should not

| criterion | level | verdict for the three error variants after #172 |
| --- | --- | --- |
| 2.4.7 Focus Visible | AA | **Pass** — a ring now renders where two variants previously had none |
| 1.4.11 Non-text Contrast | AA | **Pass** — 8.37 / 8.37 / 6.56 on the adjacencies that actually exist |
| 2.4.13 Focus Appearance | **AAA** | **Not claimed, out of scope** |

2.4.13 is explicitly *not* claimed, and it would not pass if it were. Beyond a ≥2px enclosing ring
it requires ≥3:1 between the focused and unfocused states of the indicator area; the focused ring
`red-700` `#9d0f0f` against the unfocused border `beta-500` `#e10700` measures **1.68**. Satisfying
it would need a focus colour that also clears 3:1 against `beta-500`, which does land back in
near-black territory — so the earlier `#4a0000` arithmetic is not wasted, it simply belongs under
2.4.13/AAA rather than under the contained-adjacency question, which is settled. Raised by
ASMA-8133; ratio re-measured here.

### F-16 — outlined error button, focused: white label on a pale pink tint

`--colors-button-outlined-error-focused-text-color` (`#ffffff`) on
`--colors-button-outlined-error-focused-bg-color` (`--colors-beta-100`). Consumer:
`src/components/inputs/button/StyledButton.module.scss`. **SC 1.4.3, needs 4.5:1.**
`#ffffff` on `#f7dede` = **1.27** in all three themes — effectively invisible.

Every sibling declaration uses a *dark* error colour for this text
(`outlined-error-active-text-color` is `beta-700`, `-hover-` is `beta-600`); only the `focused`
variant is `#ffffff`. Reads as a copy-paste slip from the `contained` block, where white is correct.

---

## Exemptions — pairs deliberately not asserted

Documenting per-token intent, as the ticket asks, for pairs that are never used together or that
the criteria explicitly exclude.

### Disabled states

Not asserted, for buttons (`BUTTON_STATES` omits `disabled`), menu items, tabs, chips or inputs.
Both criteria exempt them in the same words — 1.4.3 excludes "text ... that is part of an inactive
user interface component", and 1.4.11 excludes inactive components.

For the record, `--colors-delta-300` disabled text measures 1.75:1 (default/greenish) and 2.07:1
(fretex). Compliant, but low enough that it is worth a design look independently of this gate.

### `textWhite` buttons

`--colors-button-textWhite-common-*` is white text on a transparent background in every state. Held
against this package's white page surface it measures 1.00:1 — but that pairing never occurs. The
variant exists to be placed on a consumer-supplied dark surface that `asma-ui-core` never sees, so
the contrast obligation sits with the consumer. Excluded via
`BUTTON_TYPES_WITHOUT_KNOWN_SURFACE`; asserting it would be measuring a combination that does not
exist.

### `text` and `textGray` button boundaries

Excluded via `BUTTON_TYPES_WITH_BOUNDARY`. Both are borderless with a transparent fill by design:
the label is the whole affordance, and it is held to 4.5:1. SC 1.4.11 asks for the "visual
information required to identify user interface components", which the compliant label supplies. A
borderless text button is not required to also carry a 3:1 edge.

### Button hover/active background tints as a boundary

Only the **base** and **focused** boundaries are asserted for `contained` and `outlined`. A
hover/active background tint is decorative reinforcement of a state that is already conveyed by the
cursor and by the label, not the sole indicator, so 1.4.11's state-indicator clause is satisfied
without it. The *label* over those tints is still asserted — that is F-12.

### Alert container borders

`--colors-{severity}-300` on `--colors-{severity}-50` is a decorative edge on a surface that is
already distinguishable from the page, on a component that is not a control. Not a UI-component
boundary and not a state indicator, so 1.4.11 does not reach it. The severity **icon** in the same
component *is* asserted at 3:1 — in the `standard` variant the body text is neutral `delta-800`, so
the icon is the only thing carrying severity, which makes it a graphic required to understand the
content. All four severities pass (4.76–7.67).

### Table cell dividers

`--colors-delta-200` hairlines are structural, not control boundaries. Not asserted.

### `--colors-cardea--grey-*`

Bare HSL component triples (`210deg 16% 95%`), consumed as `hsl(var(--…) / <alpha-value>)`. Not
colours on their own; skipped by the token-parse test.

---

## Observations — not contrast failures, but defects the resolver surfaced

Raised here because the check found them; all sit in ASMA-8133's area and none are fixed by this
ticket.

1. **`--colors-input-disabled-disabled-outline-width: 1px`** carries the `--colors-` prefix but
   holds a length. Named explicitly in `NON_COLOUR_TOKENS_UNDER_COLOURS_PREFIX` so the parse test
   cannot be weakened by a loose pattern. Defined in
   `src/styles/components-colors/inputVariables.css`.
2. **`--colors-colors-btn-bg-mini-action`, `--colors-colors-btn-bg-mini-action-hover` and
   `--colors-colors-topbar-text`** in `fretexTokens.css` carry a doubled `colors-` segment, so they
   override nothing and the intended fretex values never apply — the `:root` defaults win instead.
   ASMA-8133 is already repairing this in PR #172.
3. **`tw-configs/twConfigs.json` reads `--color-cardea--grey-0*` (singular) while
   `rootVariables.css` defines `--colors-cardea--grey-0*` (plural)**, so all five `custom-grey-*`
   Tailwind colours resolve to nothing. No component uses one today, which is why it went
   unnoticed. Guarded going forward by the `tailwind colour bindings` test, which asserts every
   token referenced by `twConfigs.json` resolves in every theme — it would catch a future token
   rename — with these five named as known-broken. **Resolved: this is the same defect as
   ASMA-8133's item 4, not a second mismatch — PR #172 corrects exactly these five occurrences to
   the plural spelling.** The keys are kept rather than deleted because `twConfigs.json` is a
   published `exports` entry, so an external consumer may use `bg-custom-grey-*`. Note there is
   deliberately no `custom-grey-05` key even though `rootVariables.css` defines
   `--colors-cardea--grey-05`; that palette entry simply has no Tailwind consumer, which is not a
   defect. The known-broken list here can be emptied once #172 lands.

## Re-measuring after ASMA-8133 lands

These numbers are against master before ASMA-8133 (PR #172). That PR edits the token files, so
re-run the suite after it merges and update the tables here. ASMA-8133 has confirmed in writing that
`--colors-delta-300` and `--colors-delta-500` are untouched, so F-01, F-10 and F-11 are stable.

```
pnpm exec vitest --project=unit --run src/a11y
```
