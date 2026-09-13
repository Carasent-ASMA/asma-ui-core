---
'asma-ui-core': patch
---

Repair broken design-token references and guard them with a completeness test.

Every defect here failed silently: the token layer is plain CSS custom properties, and `var(--typo)`
is invalid at computed-value time, so the browser drops the declaration rather than warning.

- **Un-themed pages rendered inputs with invalid colors.** `inputVariables.css` declared the whole
  `--colors-input-*` / `--input-*` set only under `[data-theme=default|fretex|greenish]`, so a host
  page that never set a `data-theme` attribute gave `StyledTextarea` no usable text, background or
  outline colors. `:root` now leads the same selector list, so the default values always resolve.
- **`--colors-beta-400` was referenced but never defined**, leaving the error-button focused border
  invalid in the default and greenish themes. It is now part of the beta ramp (`red-300`).
- **Three Fretex overrides never applied**, because of doubled-prefix typos
  (`--colors-colors-btn-bg-mini-action`, `-hover`, and `--colors-colors-topbar-text`). Under
  `[data-theme='fretex']` the mini-action button background, its hover background and the topbar
  text color now take their intended Fretex values instead of falling through to the defaults.
- **`bg-custom-grey-*` utilities emitted invalid `hsl()`** and were dropped: `twConfigs.json` read
  `var(--color-cardea--grey-0x)` while the palette defines `--colors-cardea--grey-0x`. The
  reference is corrected; the Tailwind keys are unchanged, so no utility name changes.
- **`delta-9000` bypassed the semantic layer**, mapping straight to `--colors-gray-9000` instead of
  `--colors-delta-9000`, so themes could not override that utility. Both resolve to `#1a1d23`, so
  no rendered color changes.
- **Copy-paste duplicates dropped three input tokens**: `--colors-input-active-hover-text-color`
  was declared three times and `--colors-input-readOnly-active-text-color` twice, which meant the
  `notEditable` hover, `readOnly` hover and `readOnly` disabled text colors were missing. All
  copies carried the same value and only the `active`/`error` variants are instantiated today, so
  restoring the distinct names changes no rendered output.

Themed pages are otherwise visually unchanged. The Fretex overrides above are the intended
behaviour change; `bg-custom-grey-*` now paints where it previously painted nothing.

Also removes a leftover `console.log` from `PathfinderCard`'s `ResizeObserver` fallback, and adds
`src/tokens.test.ts`, which parses the token CSS and `tw-configs/twConfigs.json` and fails
when a referenced custom property is declared nowhere, when the `--colors-input-*` set cannot
resolve without a `data-theme` attribute, when a block declares the same property twice, when a
theme block overrides a token the base layer never declares, or when a Tailwind key reaches past
its semantic token into the raw palette.
