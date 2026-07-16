# Storybook parity ledger

Golden source: `v3.34.0` (`e8c014993bc09b21b060e9129bcebeab34c8485d`).

The MUI-removal branch must contain every story ID from the golden source. Story IDs,
args, and render scenarios that existed at the golden source remain the compatibility
contract while their component implementations move away from MUI.

## Catalog result

- Golden stories: 210
- Branch stories: 214
- Matched golden stories: 210
- Missing golden stories: 0
- New stories excluded from golden comparison: 4

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
