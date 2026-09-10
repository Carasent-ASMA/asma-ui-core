# Accessibility allowlist (axe / `@storybook/addon-a11y`)

`.storybook/preview.ts` sets `parameters.a11y.test = 'error'`, so **any** axe violation in **any** story
fails `pnpm test-storybook` and therefore fails CI (`.github/workflows/lint-and-a11y.yml`).

This file documents the stories that were already violating axe when that enforcement landed
(ASMA-8136). Each of them carries an explicit per-story override:

```ts
// axe: <rule-id> (<what it means>). ASMA-8136 allowlist - see docs/a11y-allowlist.md
parameters: { a11y: { test: 'todo' } },
```

`test: 'todo'` still *runs* axe and still reports the violation in the Storybook test UI - it just
does not fail the build. That keeps the existing debt visible instead of hiding it, while making
sure **new** stories and **regressions** in currently-clean stories fail immediately.

## Ground rules

- **Do not add entries to this list.** A new violation means the story or component should be fixed.
- Never use `test: 'off'` or `a11y.disable` to silence a story - that stops axe running at all.
- Removing an entry is the goal: fix the underlying component, delete the override block and the row
  here, then re-run `pnpm test-storybook -- --run`.
- The override is per **story**, not per rule. A story listed here is unguarded for *all* axe rules,
  so keep the entries as short-lived as possible.

## What this gate does and does not cover

Worth being precise about, so a green build is not read as "the library is accessible". The gate runs
`axe-core@4.7.2`, which enforces the *automatable* subset of WCAG - roughly a third of the criteria.

What is enforced: the 99 axe rules that are enabled by default. For contrast that means
**`color-contrast` only - WCAG 1.4.3, AA, text against its background.**

What is **not** enforced, verified against the installed axe-core rather than assumed:

- **SC 1.4.11 Non-text Contrast (AA)** - the operative criterion for focus-ring, border and
  graphical-object contrast (3:1 against adjacent colours). `wcag1411` matches **zero** of the 99
  rules, so this gate is blind to all of it.
- **SC 2.4.7 Focus Visible (AA)** - whether a control renders *any* visible focus indicator, as
  distinct from 1.4.11's "the indicator has 3:1 contrast". `wcag247` matches **zero** rules, and no
  axe rule references focus visibility or outlines at all. So a control that paints no focus ring
  whatsoever is invisible to this gate - which is not hypothetical: three error button variants
  shipped a dangling `var()` that dropped the focus border entirely, and the axe job was green
  throughout.
- **SC 2.4.11 Focus Not Obscured (Minimum) (AA)** - a focused control hidden behind a sticky header
  or overlay is an AA failure. `wcag2411` matches **zero** rules. In AA scope for this epic and
  currently checked by nothing.
- **SC 2.4.13 Focus Appearance** - focus-indicator size and contrast specifics. This is level
  **AAA**, so it is *out of* this epic's WCAG 2.2 AA scope and listed only to prevent miscitation;
  `wcag2413` also matches zero rules. Focus-ring contrast at AA is 1.4.11, not 2.4.13.
- **SC 1.4.10 Reflow (AA)** - `wcag1410` matches zero rules. (SC 1.4.12 Text Spacing does have one,
  `avoid-inline-spacing`.)
- **Six rules that axe ships but disables by default**, so they are NOT gated even though they exist:
  `target-size` (SC 2.5.8), `color-contrast-enhanced` (AAA), `aria-roledescription`, `audio-caption`,
  `identical-links-same-purpose`, `meta-refresh-no-exceptions`. Verified via `axe._audit.rules`
  (`enabled === false`). Note `target-size` in particular: touch-target size is **not** checked by
  this gate as configured. Enabling any of them requires explicit axe config
  (`parameters.a11y.config` / `options`), which would need a deliberate decision about the resulting
  baseline - `target-size` especially would likely add a large new batch of violations.
- Anything else requiring human judgement: reading order, meaningful alt text, whether a label
  actually describes its control, keyboard flows beyond the structural checks.

So "no axe violations" means "no automatically detectable violations of these 99 rules". It is a
regression gate, not a conformance claim.

## Recorded exception: the three `StyledTextarea` entries

The ground rule above says *do not add entries to this list*. Three entries were added after the
initial baseline, with explicit authorization from the ASMA-8132 epic coordinator. Recorded here so a
future reader does not conclude the rule was quietly broken.

**They are not new violations.** They are pre-existing violations that were *unmasked* by the
ASMA-8133 token repair.

Mechanism, measured rather than inferred:

- `--colors-input-*` are declared in `src/styles/components-colors/inputVariables.css`, which before
  ASMA-8133 scoped them to `[data-theme='default'], [data-theme='fretex'], [data-theme='greenish']`
  with no `:root` block.
- **The theme decorator does not apply in the vitest browser-mode a11y run.** Probed directly inside
  that environment: `document.documentElement` has `data-theme = null`, and
  `--colors-input-error-text-color` resolves to `""`. So every `var(--colors-input-*)` reference was
  invalid-at-computed-value-time during the a11y run and `StyledTextarea` fell back to inherited or
  initial colours - which happened to pass contrast.
- ASMA-8133 adds `:root` alongside the theme selectors, so the tokens resolve and the component
  renders its **actual designed colours**, which fail SC 1.4.3.

Confirmed by bisection: with the ASMA-8133 stylesheet applied, these three stories fail; with the same
stylesheet minus the single added `:root,` line, all 15 stories in the file pass. The `:root`
declaration is the whole difference.

| Measured pair | Ratio | Needs | What it is |
| --- | --- | --- | --- |
| `#e10700` on `#f7dede` | **3.88** | 4.5 | `--colors-input-error-text-color` (error-500) on `--colors-input-error-bg-color` (error-100) |
| `#bdc4cf` on `#ffffff` | **1.75** | 4.5 | `--colors-input-*-placeholder-color` / disabled text (delta-300) on white |

Cross-references: ASMA-8138's `docs/a11y-contrast.md` independently catalogued the `#bdc4cf` pair at
token level as **F-11**, so the two documents agree on the number from different toolchains. The
colours themselves are a design decision and belong to the design-signed follow-up ticket, not here.

**Two consequences worth stating plainly.**

First, the broken token layer was *masking real design defects* - repairing it made two latent 1.4.3
failures observable for the first time, which is a stronger argument for ASMA-8133 than its changeset
makes.

Second, the rest of the baseline is **not** cast into doubt by this, and the bound is structural
rather than just "the run came back green". Only one stylesheet was theme-scoped-only; the palette and
semantic tokens were always `:root`, so they resolved with or without `data-theme`:

| Stylesheet (pre-ASMA-8133) | Selector | Resolved without `data-theme`? |
| --- | --- | --- |
| `color-variables/rootVariables.css` | `:root` | yes |
| `color-variables/defaultTokens.css` | `:root` | yes |
| `color-variables/fretexTokens.css` | `[data-theme='fretex']` | n/a - not the default theme |
| `color-variables/jadeTokens.css` | `[data-theme='greenish']` | n/a - not the default theme |
| `components-colors/inputVariables.css` | `[data-theme='default'\|'fretex'\|'greenish']` | **no - the only gap** |

And the `--colors-input-*` / `--input-*` family has exactly **one** consumer in the library:
`src/components/inputs/textarea/StyledTextarea.module.scss`. So the retroactive exposure is bounded to
`StyledTextarea` and nothing else - which is why there were no `StyledTextarea` entries in the original
120 (it was rendering fallback colours) and why the epic's combined-tree integration test found exactly
these three stories and no others.

Two figures elsewhere in this document are therefore sound on first principles, not merely by a green
run: the 13 `StyledInputField` entries (`text-delta-500` = `#7a899e`, a Tailwind utility resolving
`--colors-delta-500` from `defaultTokens.css` at `:root`) and the `Avatar` entry
(`--colors-delta-300` = `#bdc4cf`, likewise `:root`). Neither is a `--colors-input-*` token.

The forward-looking rule still holds: **run any future re-baseline after the token repair, not
before** - and note the environment asymmetry that caused this, since it will bite again. The theme
decorator *does* apply in VRT (which is why VRT stayed 317/317 across the token repair) but does *not*
apply in the vitest browser-mode a11y run.

## Baseline

| Metric | Count |
| --- | --- |
| Stories in the suite | 327 |
| Stories failing axe when enforcement landed | **123** |
| Story files affected | 33 |
| Distinct (story, rule) violations | 159 |
| Distinct axe rules violated | 15 |

### Violations by rule

| Rule | Impact | Stories | What axe reports |
| --- | --- | --- | --- |
| `color-contrast` | serious | 53 | Elements must meet minimum colour contrast ratio thresholds |
| `label` | critical | 49 | Form elements must have labels |
| `button-name` | critical | 23 | Buttons must have discernible text |
| `aria-allowed-attr` | serious | 7 | ARIA attributes must be allowed for an element’s role |
| `nested-interactive` | serious | 5 | Interactive controls must not be nested |
| `aria-hidden-focus` | serious | 4 | aria-hidden elements must not contain focusable elements |
| `aria-valid-attr-value` | serious | 4 | ARIA attributes must have valid values |
| `empty-table-header` | minor | 3 | Table header text should not be empty |
| `heading-order` | moderate | 2 | Heading levels should only increase by one |
| `label-title-only` | serious | 2 | Form elements should have a visible label, not only title/aria-describedby |
| `scrollable-region-focusable` | serious | 2 | Scrollable region must have keyboard access |
| `landmark-unique` | moderate | 2 | Landmarks must have a unique role or role/label/title combination |
| `duplicate-id-active` | serious | 1 | IDs of active elements must be unique |
| `aria-input-field-name` | serious | 1 | ARIA input fields must have an accessible name |
| `aria-required-children` | critical | 1 | Certain ARIA roles must contain particular children |

## Allowlisted stories

### `src/components/custom/pathfinder-card/story/PathfinderCard.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `BreakpointMatrixWithAvatar` (Breakpoint Matrix With Avatar) | `aria-hidden-focus` , `color-contrast` , `nested-interactive` | aria-hidden elements must not contain focusable elements; Elements must meet minimum colour contrast ratio thresholds; Interactive controls must not be nested |
| `BreakpointMatrixWithoutAvatar` (Breakpoint Matrix Without Avatar) | `aria-hidden-focus` , `color-contrast` , `nested-interactive` | aria-hidden elements must not contain focusable elements; Elements must meet minimum colour contrast ratio thresholds; Interactive controls must not be nested |
| `DesktopExpandedWithAvatar` (Desktop Expanded With Avatar) | `aria-hidden-focus` , `color-contrast` , `nested-interactive` | aria-hidden elements must not contain focusable elements; Elements must meet minimum colour contrast ratio thresholds; Interactive controls must not be nested |
| `DesktopExpandedWithoutAvatar` (Desktop Expanded Without Avatar) | `aria-hidden-focus` , `color-contrast` , `nested-interactive` | aria-hidden elements must not contain focusable elements; Elements must meet minimum colour contrast ratio thresholds; Interactive controls must not be nested |

### `src/components/custom/widget/widget/story/StyledWidget.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Widget` (Widget) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/data-display/ai-disclosure/StyledAIDisclosure.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Documentation` (Documentation) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/data-display/chip/StyledChip.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Chip` (Chip) | `aria-allowed-attr` , `color-contrast` | ARIA attributes must be allowed for an element’s role; Elements must meet minimum colour contrast ratio thresholds |
| `FigmaPaddingMedium` (Figma Padding Medium) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/data-display/interactive-chip/StyledInteractiveChip.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Radio_Default` (Radio Default) | `aria-allowed-attr` | ARIA attributes must be allowed for an element’s role |
| `Radio_Focused` (Radio Focused) | `aria-allowed-attr` | ARIA attributes must be allowed for an element’s role |
| `Radio_Readonly` (Radio Readonly) | `aria-allowed-attr` | ARIA attributes must be allowed for an element’s role |
| `Radio_WithReactNodeLabel` (Radio With React Node Label) | `aria-allowed-attr` | ARIA attributes must be allowed for an element’s role |

### `src/components/data-display/virtualized-list/VirtualizedList.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `FiveThousandRows` (Five Thousand Rows) | `scrollable-region-focusable` | Scrollable region must have keyboard access |
| `VariableHeights` (Variable Heights) | `scrollable-region-focusable` | Scrollable region must have keyboard access |

### `src/components/feedback/filtered-empty-state/StyledFilteredEmptyState.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Playground` (Playground) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/feedback/minimizable-dialog/stories/MinimizableDialogStack.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `ClosingParentClosesDependentDialog` (Closing Parent Closes Dependent Dialog) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `Default` (Default) | `color-contrast` , `label` | Elements must meet minimum colour contrast ratio thresholds; Form elements must have labels |
| `OpenCloseIndividually` (Open Close Individually) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/feedback/snack-bar/story/StyledAlert.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Gallery` (Gallery) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/feedback/snack-bar/story/StyledSnackbar.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `AllVariants` (All Variants) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `Default` (Default) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `InsideDialog` (Inside Dialog) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds **(intermittent - fails only on some runs)** |
| `PlacementInContext` (Placement In Context) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/inputs/checkbox/StyledCheckbox.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Checked_Default` (Checked Default) | `label` | Form elements must have labels |
| `Checked_Disabled` (Checked Disabled) | `label` | Form elements must have labels |
| `Checked_Focused` (Checked Focused) | `label` | Form elements must have labels |
| `Checked_Hover` (Checked Hover) | `label` | Form elements must have labels |
| `Indeterminate_Default` (Indeterminate Default) | `label` | Form elements must have labels |
| `Indeterminate_Disabled` (Indeterminate Disabled) | `label` | Form elements must have labels |
| `Indeterminate_Focused` (Indeterminate Focused) | `label` | Form elements must have labels |
| `Indeterminate_Hover` (Indeterminate Hover) | `label` | Form elements must have labels |
| `Unchecked_Default` (Unchecked Default) | `label` | Form elements must have labels |
| `Unchecked_Disabled` (Unchecked Disabled) | `label` | Form elements must have labels |
| `Unchecked_Focused` (Unchecked Focused) | `label` | Form elements must have labels |
| `Unchecked_Hover` (Unchecked Hover) | `label` | Form elements must have labels |

### `src/components/inputs/checkbox/base-ui/StyledCheckbox.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Checkbox` (Checkbox) | `label` | Form elements must have labels |
| `CheckboxWithLabel` (Checkbox With Label) | `label` | Form elements must have labels |
| `Interactive` (Interactive) | `label` | Form elements must have labels |

### `src/components/inputs/dynamic-select/StyledDynamicSelect.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `LargeMultipleSelectAutocomplete` (Large Multiple Select Autocomplete) | `button-name` , `label` | Buttons must have discernible text; Form elements must have labels |
| `LongLabelsAndDisabledOptions` (Long Labels And Disabled Options) | `aria-allowed-attr` , `button-name` , `color-contrast` , `label` | ARIA attributes must be allowed for an element’s role; Buttons must have discernible text; Elements must meet minimum colour contrast ratio thresholds; Form elements must have labels |
| `MultipleSelectAutocomplete` (Multiple Select Autocomplete) | `button-name` , `label` | Buttons must have discernible text; Form elements must have labels |
| `MultipleSelectChipGroup` (Multiple Select Chip Group) | `button-name` , `color-contrast` , `label` | Buttons must have discernible text; Elements must meet minimum colour contrast ratio thresholds; Form elements must have labels |
| `Playground` (Playground) | `button-name` , `color-contrast` , `label` | Buttons must have discernible text; Elements must meet minimum colour contrast ratio thresholds; Form elements must have labels |
| `ReadOnlyAutocompleteDoesNotOpen` (Read Only Autocomplete Does Not Open) | `button-name` , `label` | Buttons must have discernible text; Form elements must have labels |
| `SingleSelectAutocomplete` (Single Select Autocomplete) | `button-name` , `label` | Buttons must have discernible text; Form elements must have labels |
| `SingleSelectChipGroup` (Single Select Chip Group) | `aria-allowed-attr` , `button-name` , `color-contrast` , `label` | ARIA attributes must be allowed for an element’s role; Buttons must have discernible text; Elements must meet minimum colour contrast ratio thresholds; Form elements must have labels |

### `src/components/inputs/input-field/story/StyledInputField.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `AriaDescribedBy` (Aria Described By) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `AutofillKeyAndLabelAssociation` (Autofill Key And Label Association) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `BrowserDefaultAutofill` (Browser Default Autofill) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `Default` (Default) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `ExplicitId` (Explicit Id) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `Focused` (Focused) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `Gallery` (Gallery) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `HtmlInputSlotAutoCompleteWins` (Html Input Slot Auto Complete Wins) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `LiveTyping` (Live Typing) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `MultilineEmpty` (Multiline Empty) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `ReserveHelperTextFalse` (Reserve Helper Text False) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `ReservedHelperSlot` (Reserved Helper Slot) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `TopLevelAutoCompleteWins` (Top Level Auto Complete Wins) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/inputs/label/StyledLabel.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Label` (Label) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/inputs/radio-button/StyledRadio.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Checked_Default` (Checked Default) | `label` | Form elements must have labels |
| `Checked_Disabled` (Checked Disabled) | `label` | Form elements must have labels |
| `Checked_Focused` (Checked Focused) | `label` | Form elements must have labels |
| `Group` (Group) | `label` | Form elements must have labels |
| `Unchecked_Default` (Unchecked Default) | `label` | Form elements must have labels |
| `Unchecked_Disabled` (Unchecked Disabled) | `label` | Form elements must have labels |
| `Unchecked_Focused` (Unchecked Focused) | `label` | Form elements must have labels |

### `src/components/inputs/radio-button/base-ui/StyledRadio.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Checked_Default` (Checked Default) | `label` | Form elements must have labels |
| `Checked_Disabled` (Checked Disabled) | `label` | Form elements must have labels |
| `Checked_Focused` (Checked Focused) | `label` | Form elements must have labels |
| `DefaultErrorText` (Default Error Text) | `label` | Form elements must have labels |
| `ErrorText` (Error Text) | `label` | Form elements must have labels |
| `Gallery` (Gallery) | `label` | Form elements must have labels |
| `Group` (Group) | `label` | Form elements must have labels |
| `Interactive` (Interactive) | `label` | Form elements must have labels |
| `Unchecked_Default` (Unchecked Default) | `label` | Form elements must have labels |
| `Unchecked_Disabled` (Unchecked Disabled) | `label` | Form elements must have labels |
| `Unchecked_Focused` (Unchecked Focused) | `label` | Form elements must have labels |

### `src/components/inputs/select-autocomplete/story/StyledSelectAutocomplete.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Gallery` (Gallery) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `LargeDataset` (Large Dataset) | `label` | Form elements must have labels |
| `Performance_LargeDataset` (Performance Large Dataset) | `label` | Form elements must have labels |
| `Performance_MultipleChips` (Performance Multiple Chips) | `label` | Form elements must have labels |
| `Performance_RenderCount` (Performance Render Count) | `label` | Form elements must have labels |
| `ReadOnlyDoesNotOpen` (Read Only Does Not Open) | `label` | Form elements must have labels |
| `SelectAllTogglesAllOptions` (Select All Toggles All Options) | `aria-required-children` | Certain ARIA roles must contain particular children |

### `src/components/inputs/select/story/StyledSelect.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `EmptyOptions` (Empty Options) | `aria-valid-attr-value` | ARIA attributes must have valid values |
| `MultipleSelectBehavior` (Multiple Select Behavior) | `aria-input-field-name` , `aria-valid-attr-value` , `button-name` | ARIA input fields must have an accessible name; ARIA attributes must have valid values; Buttons must have discernible text |
| `OptionAndValueAre16px` (Option And Value Are 16 Px) | `aria-valid-attr-value` | ARIA attributes must have valid values |
| `RapidOpenClose` (Rapid Open Close) | `aria-valid-attr-value` | ARIA attributes must have valid values |

### `src/components/inputs/switch/base-ui/StyledSwitch.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Checked_Default` (Checked Default) | `button-name` | Buttons must have discernible text |
| `Checked_Disabled` (Checked Disabled) | `button-name` , `color-contrast` | Buttons must have discernible text; Elements must meet minimum colour contrast ratio thresholds |
| `Checked_Focused` (Checked Focused) | `button-name` | Buttons must have discernible text |
| `Checked_Hovered` (Checked Hovered) | `button-name` | Buttons must have discernible text |
| `CompositeLeftLabelError` (Composite Left Label Error) | `button-name` | Buttons must have discernible text |
| `Gallery` (Gallery) | `button-name` | Buttons must have discernible text |
| `Interactive` (Interactive) | `button-name` | Buttons must have discernible text |
| `Unchecked_Default` (Unchecked Default) | `button-name` | Buttons must have discernible text |
| `Unchecked_Disabled` (Unchecked Disabled) | `button-name` , `color-contrast` | Buttons must have discernible text; Elements must meet minimum colour contrast ratio thresholds |
| `Unchecked_Focused` (Unchecked Focused) | `button-name` | Buttons must have discernible text |
| `Unchecked_Hovered` (Unchecked Hovered) | `button-name` | Buttons must have discernible text |

### `src/components/inputs/textarea/StyledTextarea.stories.tsx`

Added by recorded exception - see "Recorded exception" above. Pre-existing violations unmasked by the
ASMA-8133 token repair, not new defects.

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Disabled` (Disabled) | `color-contrast` | Disabled placeholder `#bdc4cf` on `#ffffff` = 1.75, needs 4.5 |
| `Error` (Error) | `color-contrast` | Error text `#e10700` on error background `#f7dede` = 3.88, needs 4.5 |
| `Gallery` (Gallery) | `color-contrast` | Error text `#e10700` on error background `#f7dede` = 3.88, needs 4.5 |

### `src/components/mui-compat/Avatar.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Default` (Default) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `Gallery` (Gallery) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `Shapes` (Shapes) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/navigation/link/StyledLink.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Gallery` (Gallery) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `Link` (Link) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/navigation/menu/StyledMenu.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Menu` (Menu) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/components/utils/accordion/StyledAccordion.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Accordion` (Accordion) | `landmark-unique` | Landmarks must have a unique role or role/label/title combination |

### `src/components/utils/accordion/base-ui/StyledAccordion.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `Gallery` (Gallery) | `landmark-unique` | Landmarks must have a unique role or role/label/title combination |

### `src/datetime/stories/DatePickerCalendarStates.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `AllDayStates` (All Day States) | `button-name` | Buttons must have discernible text |

### `src/datetime/stories/StyledDatePicker.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `DatePicker` (Date Picker) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `KeyboardEntry` (Keyboard Entry) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/datetime/stories/StyledTimePicker.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `ColorThemes` (Color Themes) | `button-name` | Buttons must have discernible text |
| `Gallery` (Gallery) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |
| `TimePicker` (Time Picker) | `color-contrast` | Elements must meet minimum colour contrast ratio thresholds |

### `src/stories/inputs/InputsStories.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `FormInputs` (Form Inputs) | `color-contrast` , `heading-order` , `label-title-only` , `label` | Elements must meet minimum colour contrast ratio thresholds; Heading levels should only increase by one; Form elements should have a visible label, not only title/aria-describedby; Form elements must have labels |
| `FormInputsHeightConsistency` (Form Inputs Height Consistency) | `color-contrast` , `heading-order` , `label-title-only` , `label` | Elements must meet minimum colour contrast ratio thresholds; Heading levels should only increase by one; Form elements should have a visible label, not only title/aria-describedby; Form elements must have labels |

### `src/table/stories/StyledTable.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `FooterRowCountBoundary` (Footer Row Count Boundary) | `duplicate-id-active` | IDs of active elements must be unique |
| `SizingPersistenceAndControlAlignment` (Sizing Persistence And Control Alignment) | `button-name` , `empty-table-header` , `nested-interactive` | Buttons must have discernible text; Table header text should not be empty; Interactive controls must not be nested |

### `src/table/stories/TGrini.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `TGrini` (T Grini) | `empty-table-header` | Table header text should not be empty |

### `src/table/stories/TableV2.stories.tsx`

| Story | Rule id(s) | Violation |
| --- | --- | --- |
| `TableV2` (Table V 2) | `empty-table-header` | Table header text should not be empty |

## Burn-down notes

Concrete follow-up work identified while baselining. These are **not** fixed by ASMA-8136, which only
adds enforcement; each needs its own ticket so it can carry interaction/visual evidence.

### `color-contrast` (53 stories across 20 files - the largest cluster)

Mostly design-token level, not per-component, so it is likely a handful of token decisions rather than
53 separate fixes. The two biggest clusters:

- `StyledInputField` (13 stories): the floating label renders `text-delta-500` = `#7a899e` on `#ffffff`
  = **3.55:1**, below the 4.5:1 threshold. One token decision clears all 13.
- `Avatar`: initials use `#ffffff` on the avatar palette - `#36b17a` (2.71:1), `#ff7b2e` (2.58:1),
  `#b66e97` (3.7:1) and `--colors-delta-300` = `#bdc4cf` (**1.75:1**). The palette needs darker variants
  or dark text.

These hinge on resolved token values, so they can move when the token layer changes. Confirmed with
ASMA-8133 (token-layer work in the same epic) that `--colors-delta-300` (`#bdc4cf`) and
`--colors-delta-500` (`#7a899e`) are *not* touched by it, so the two figures above are stable. The
general point still holds: after any token change, re-run the suite rather than trusting recorded
ratios.

### `button-name` (23 stories across 6 files)

Icon-only buttons with no accessible name. The missing name is **per call site**: `StyledButton` cannot
invent a label for an icon-only instance, so each site needs its own `aria-label`.

Two components dominate the count - `base-ui/StyledSwitch` (11 stories) and `StyledDynamicSelect`
(8 stories) account for 19 of the 23, and each is one component repeated across many stories, so two
fixes clear most of this rule.

The remaining four are distinct call sites (confirmed with ASMA-8134, who owns these files):

- `src/table/components/columns/showTextColumn.tsx` - the expand-text button (`data-test="expand-text-button"`),
  table-only.
- `src/datetime/.../DatePickerButton.tsx` - calendar glyph, `startIcon={<OutlineCalendarMonth />}`.
- `src/datetime/.../StyledCalendarPickerCaption.tsx` - close glyph, `startIcon={<CloseIcon />}`.
- `src/components/inputs/select/story/StyledSelect.stories.tsx` - one story (`RapidOpenClose`).

There is no single shared fix across them.

### `nested-interactive` (5 stories: 4 in `PathfinderCard`, 1 in `StyledTable`)

The table renders a real focusable `<input type="checkbox">` inside a cell wrapper that already owns the
selection state:

```html
<div role="checkbox" tabindex="0" aria-label="Select all rows" aria-checked="false">
```

axe is explicit that this cannot be papered over: "Using a negative tabindex on an element inside an
interactive control does not prevent assistive technologies from focusing the element (even with
`aria-hidden=true`)". Only removing the inner `<input>` fixes it.

The four `PathfinderCard` stories fail the same rule and additionally fail `aria-hidden-focus`, i.e. that
card has focusable content inside an `aria-hidden` subtree as well - a separate defect in the same
component, worth fixing together.

The core checkbox already has a `decorative` prop built for exactly this case (identical visual box, no
`<input>`). **Follow-up: adopt `decorative` on the table checkbox, with keyboard/selection interaction
tests** - it removes a real input from every row, so it needs test coverage proving the table's
selection and keyboard handling do not depend on it. Deliberately out of scope for the ASMA-8134 dedupe
PR, which is constrained to no behaviour changes.

### `empty-table-header` (3 stories: `StyledTable`, `TGrini`, `TableV2`)

The select-all column renders an empty header cell:

```html
<th colspan="1" style="width: 38px; ..."><div ...><div class="_header-content_..."></div></div></th>
```

A visually-hidden label on that one `<th>` should clear all three files at once. Note it is a fixed 38px
cell, so the fix needs a visual check that added content does not affect layout.

### `duplicate-id-active` (1 story, `StyledTable > Footer Row Count Boundary`)

The story renders several tables in one canvas and the row DOM `id` comes straight from the row key, so
ids collide across table instances (`id="1"` .. `id="5"` appear more than once). Fixable by namespacing
the row id per table instance. The stories assert on `data-test`, not `id`, so this looks selector-safe.

### `label` (49 stories across 8 files)

Form controls with no associated label, concentrated in a few input families - `StyledCheckbox` (12),
`base-ui/StyledRadio` (11), `StyledDynamicSelect` (8), `StyledRadio` (7) and `StyledSelectAutocomplete`
(5). This is the second-largest cluster but the most concentrated one: five components account for 43 of
the 49 stories, so it is worth auditing as one pass over the input components rather than story by story.

### Intermittent entry

`StyledSnackbar > InsideDialog` fails `color-contrast` only on some runs (it failed in 1 of 3 baseline
runs) - the snackbar is animating, so axe sometimes samples it mid-transition. It is allowlisted because
an unguarded flaky story would make CI red at random. When fixing the snackbar contrast, also make the
story deterministic (wait for the transition to settle) so the flake does not come back.

## Reproducing the baseline

```bash
pnpm test-storybook -- --run
```

To see what a listed story actually violates, delete its override block and re-run - axe prints the
offending node, the rule id and the remediation for each violation.
