# Per-theme colour contrast — findings register

WCAG 2.2 AA, success criteria **1.4.3 Contrast (Minimum)** and **1.4.11 Non-text Contrast**.

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
4. Quarantined pairs are `it.skip`, so they do not currently detect *regression* on an
   already-failing pair. That is the accepted cost of not blocking the epic on design sign-off. Once
   a finding is resolved, delete its `finding` key and the assertion becomes live.

## Status

| | |
| --- | --- |
| Pairs asserted and passing | 205 |
| Pairs quarantined | 90 |
| Distinct findings | 15 |
| Themes covered | 3 (`default`, `fretex`, `greenish`) |

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
border at all** — the failure is not a low ratio, it is a missing focus indicator. **SC 1.4.11
(needs 3:1) and SC 2.4.11 Focus Appearance.**

`fretex` escapes only because it independently overrides all three declarations to
`var(--colors-gama-400)` — where it then lands at **2.24**, i.e. F-07 again.

This is the finding that most justifies a token-level check: no rendered test can see it, because
in the browser the broken declaration simply vanishes.

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
   `rootVariables.css` defines `--colors-cardea--grey-0*` (plural)**, so the `custom-grey-*`
   Tailwind colours resolve to nothing.

## Re-measuring after ASMA-8133 lands

These numbers are against master before ASMA-8133 (PR #172). That PR edits the token files, so
re-run the suite after it merges and update the tables here. ASMA-8133 has confirmed in writing that
`--colors-delta-300` and `--colors-delta-500` are untouched, so F-01, F-10 and F-11 are stable.

```
pnpm exec vitest --project=unit --run src/a11y
```
