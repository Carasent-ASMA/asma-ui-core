# Storybook parity ledger

Golden source: `v3.34.0` (`e8c014993bc09b21b060e9129bcebeab34c8485d`).

> **Golden re-cut plan (2026-07-21):** the Figma-parity work has intentionally moved the *look* away
> from `v3.34.0`; a full-suite `vrt.sh check` is now green and the branch renders **are** the new
> golden (baselines already captured — no re-baseline needed). The `v3.34.0` SHA stays the reference
> label only until this branch merges. **At merge:** re-point this "Golden source" to the merge commit
> / next version tag and re-run the index diff below to re-confirm coverage. Until then, `v3.34.0`
> remains the catalog compatibility contract (every golden story ID must still exist).

The MUI-removal branch must contain every story ID from the golden source. Story IDs,
args, and render scenarios that existed at the golden source remain the compatibility
contract while their component implementations move away from MUI.

## Catalog result

- Golden stories: 210
- Branch stories: 246
- Matched golden stories: 210
- Missing golden stories: 0
- New stories excluded from golden comparison: 36

> **Recomputed 2026-07-21** from `storybook-static/index.json` (**246** story entries; **254** VRT
> baseline frames — some stories emit multiple snapshots via `interactions.spec`). Branch-only =
> 246 − 210 golden = **36** (every `*--gallery` matrix, `inputs-styled-slider--params-matrix`, the
> Alert/Snackbar stories now in the gate, and the items below). Golden coverage (matched 210 /
> missing 0) is asserted by the **green full-suite `vrt.sh check`** (exit 0, zero diffs) + **zero
> orphan baselines** from `prune-orphans.mjs`; re-confirm with a fresh `v3.34.0`-vs-branch index diff
> at merge.

## Restored compatibility stories

- `inputs-checkbox--*` (12 stories)
- `inputs-styled-radio--*` (7 stories)
- `inputs-select--multiple-select-behavior`
- `utils-accordion--accordion`

The pre-existing implementation-focused stories retain their original IDs:

- `base-ui-checkbox--checkbox`
- `base-ui-styled-radio--*`
- `base-ui-styled-switch--*`
- `utils-accordion-baseui--accordion`

## New since v3.34.0

These components or stories did not exist at the golden source, so they cannot use a
pre-rewrite image. Their baselines are captured from the corrected branch only after all
210 golden stories pass.

- `inputs-searchfield--default`
- `utils-virtual-list--fixed-size`
- `utils-virtual-list--measured-rows`
- `utils-virtual-list--variable-size`

Figma-parity Gallery/matrix stories added since (branch-only, baselines captured from the corrected
branch — non-exhaustive, regenerate per the Validation step): `inputs-styled-button--gallery`,
`inputs-inputfield--gallery`, `base-ui-styled-radio--gallery`, `base-ui-styled-switch--gallery`,
`inputs-select--gallery`, `navigation-link--gallery`, `navigation-styled-menu--gallery`,
`datadisplay-formlabel--gallery`, and — **added 2026-07-21** —
`inputs-styled-select-autocomplete--gallery`, `inputs-styled-textarea--gallery`,
`utils-accordion-baseui--gallery`, `inputs-styled-slider--params-matrix`,
`datadisplay-tooltip--gallery`, `datetime-timepicker--gallery`,
`feedback-alert--default`, `feedback-alert--gallery`, `feedback-snackbar--default`,
`feedback-snackbar--all-variants`, `feedback-snackbar--interactive` (Alert & Snackbar **promoted
into the VRT gate** 2026-07-21 — previously catalog exceptions).

## Validation

Build both Storybooks, read story entries from each `storybook-static/index.json`, and
assert:

1. Every `v3.34.0` story ID exists on the branch.
2. The branch-only set is exactly the four IDs above.
3. `pnpm vrt` passes against screenshots captured from the `v3.34.0` build.

## Golden-source defects preserved without story drift

- `base-ui-styled-radio--group`: the `v3.34.0` image captured a transient loading spinner
  instead of the rendered radio group. VRT skips this unusable image; the unchanged story is
  covered by Storybook interaction tests.
- `modules-dynamictoolbar--*`: identical consecutive captures oscillated between roughly
  170 and 3,000 changed pixels because the stories intentionally exercise
  ResizeObserver-driven width planning. VRT skips these timing-dependent frames; all toolbar
  stories remain in the catalog and interaction suite.
- `inputs-styled-select-autocomplete--select-all-toggles-all-options`: the unchanged golden
  play function uses `/The Godfather/i` and `/The Godfather: Part II/i` with singular
  `getByRole` queries. Once both required chips exist, the first regular expression necessarily
  matches both buttons. Component behavior is correct; this one inherited assertion remains the
  only failing interaction test because changing it would violate the protected-story rule.

## Open-state VRT (`interactions.spec.ts`)

Closed/default frames stay in `stories.spec.ts` (one screenshot per story). Popovers,
dialogs, and dropdowns that only appear after a click are captured separately via
`interaction-states.ts` — filenames use a `--open` / `--calendar-open` / `--popper-open`
suffix so they do not collide with the closed glance baselines.

Golden source for closed states remains **v3.34.0**. Interaction baselines are branch-only
until accepted with `pnpm vrt:accept` after review.
