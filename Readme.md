# asma-ui-core

The ASMA design system — the shared React component library that ASMA frontends build their UI from.
Form controls, selects and comboboxes, dialogs, menus, tooltips, tables, date/time pickers, ~180
icons, and the colour and typography tokens behind them.

**This library has no MUI and no Base UI.** Every component is a native implementation on plain HTML,
ARIA and Tailwind. That rewrite cut the dependency footprint from ~324 KB to ~57 KB gzipped — see
[Bundle size](#bundle-size-and-the-mui-removal).

- **New here?** Start with [Quick start](#quick-start), then browse [What's in the box](#whats-in-the-box).
- **Upgrading an app from an older version?** Read [Migrating from the MUI-era version](#migrating-from-the-mui-era-version) first — some things break silently.
- **Something looks wrong?** [Troubleshooting](#troubleshooting) covers the usual suspects.

---

## Contents

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [What's in the box](#whats-in-the-box)
- [Figma ↔ React matching](#figma--react-matching)
- [Styling API](#styling-api)
- [Theming](#theming)
- [Bundle size and the MUI removal](#bundle-size-and-the-mui-removal)
- [Migrating from the MUI-era version](#migrating-from-the-mui-era-version)
- [Troubleshooting](#troubleshooting)
- [Contributing to the library](#contributing-to-the-library)

---

## Requirements

| | |
| --- | --- |
| React | 18 or 19 (peer dependency) |
| Tailwind CSS | v3 or v4 — both are in use across ASMA apps; wiring differs slightly, see below |
| Bundler | Anything ESM-native (Vite is what every ASMA app uses) |
| Package | Public on npm as `asma-ui-core` — no registry setup needed |

The library ships prebuilt ESM in `dist/` with TypeScript declarations. Its own runtime dependencies
(`@floating-ui/react`, `@tanstack/react-table`, `@dnd-kit/*`, `date-fns`, `notistack`,
`react-day-picker`, `clsx`) install transitively — you do not declare them yourself.

---

## Quick start

### 1. Install

```bash
pnpm add asma-ui-core
```

### 2. Import the stylesheet

`dist/style.css` carries the design tokens, the component styles and a required reset for native
popover elements. **Nothing renders correctly without it.** Import it *before* Tailwind so your own
utilities can win.

**Tailwind v4:**

```css
/* src/styles/index.css */
@config '../../tailwind.config.ts';

@import 'asma-ui-core/dist/style.css';
@import 'tailwindcss';
```

**Tailwind v3:**

```scss
// src/styles/index.scss
@use 'asma-ui-core/dist/style.css' as core;
@use 'tailwindcss/base';
@use 'tailwindcss/components';
@use 'tailwindcss/utilities';
```

### 3. Extend your Tailwind config with the shared tokens

The design tokens live in `tw-configs/twConfigs.json` — colours, shadows, animations, keyframes and
the font stack. Spread them into your own config rather than redefining them; a token change belongs
in this library, not in your app.

```ts
// tailwind.config.ts
import twConfigs from 'asma-ui-core/tw-configs/twConfigs.json'
import type { Config } from 'tailwindcss'

const { boxShadow, animation, keyframes, colors, fontFamily } = twConfigs

export default {
    content: ['index.html', 'src/**/*.{tsx,ts,jsx,js}'],
    darkMode: 'media',
    important: true,
    plugins: [],
    theme: {
        extend: { animation, boxShadow, colors, keyframes },
        fontFamily,
    },
} satisfies Config
```

Two notes on this config:

- **`important: true` is recommended, not decorative.** This library's own compiled CSS is built with
  it, so its utilities emit as `!important`. If your app's utilities are *not*, you will lose class
  conflicts against the library in confusing ways. Match it.
- ASMA apps additionally import `twScreens` from `asma-types` and pass it as `theme.extend.screens`
  to share breakpoints. That package is internal — outside ASMA, just use your own breakpoints.

### 4. Render something

```tsx
import { StyledButton, StyledInputField } from 'asma-ui-core'

export const Example = () => (
    <form className='flex flex-col gap-4'>
        <StyledInputField label='Full name' fullWidth />
        <StyledButton variant='contained' type='submit'>
            Save
        </StyledButton>
    </form>
)
```

> **Pass `fullWidth` when you want a field to fill its container.** Without it, `StyledInputField`
> is pinned to 235px by design. This is the single most common surprise for new users.

### 5. Add the snackbar provider (optional)

There is no theme provider — that went away with emotion. The one provider most apps mount is the
snackbar host, needed only if you use toasts:

```tsx
import { SnackbarProvider, enqueueSnackbar } from 'asma-ui-core'

<SnackbarProvider>
    <App />
</SnackbarProvider>

// anywhere below it
enqueueSnackbar('Saved', { variant: 'alert', severity: 'success' })
```

It wraps [notistack](https://notistack.com) with the ASMA variants (`alert`, `info`, `default`) and
re-parents the toast stack into the topmost open modal `<dialog>`, so toasts stay visible and
clickable above a `StyledDialog`.

---

## What's in the box

Every component is exported from the package root. Browse them interactively with Storybook (see
[below](#browsing-the-components)); this table is for discovery.

| Area | Components |
| --- | --- |
| **Buttons & actions** | `StyledButton`, `StyledLink`, `CopyButton`, `CopyWrapper` |
| **Text inputs** | `StyledInputField`, `StyledTextarea`, `StyledSearchField`, `StyledLabel` |
| **Selects** | `StyledSelect` + `StyledSelectItem` (single), `StyledSelectAutocomplete` (combobox), `StyledDynamicSelect` (chip multi-select), `Listbox` (headless) |
| **Toggles** | `StyledCheckbox`, `StyledRadio` / `StyledRadioGroup`, `StyledSwitch`, `StyledSlider` |
| **Form scaffolding** | `StyledFormControl`, `StyledFormControlLabel`, `StyledFormGroup`, `StyledFormLabel`, `StyledFormHelperText`, `StyledInputLabel` |
| **Date & time** | `StyledDatePicker`, `StyledTimePicker`, plus `setMidnightTime` / `setZeroTime` helpers |
| **Overlays** | `StyledDialog` (+ `Title` / `Content` / `Actions`), `MinimizableDialog`, `StyledDrawer`, `StyledPopover`, `StyledTooltip`, `createDialogStack` |
| **Menus** | `StyledMenu`, `StyledMenuList`, `StyledMenuItem`, `StyledFilterMenu`, `StyledFilterButton` |
| **Navigation** | `StyledTabs`, `StyledTab`, `StyledAccordion` (+ `Summary` / `Details`) |
| **Data display** | `StyledTable`, `VirtualList`, `StyledTypography`, `StyledBadge`, `StyledChip`, `StyledInteractiveChip`, `StyledAIDisclosure` |
| **Feedback** | `StyledAlert`, `StyledSnackbar`, `SnackbarProvider`, `StyledLoading`, `StyledEmptyPage`, `StyledFilteredEmptyState` |
| **Layout / widgets** | `StyledWidget`, `StyledWidgetHeader`, `StyledWidgetTitle`, `StyledModuleTitle`, `DynamicToolbar` |
| **Primitives** | `Paper`, `Stack`, `Container`, `Avatar`, `Skeleton`, `Fade`, `Popper`, `ClickAwayListener` |
| **Hooks & utils** | `usePopupState` (+ `bindTrigger` / `bindPopover` / `bindPopper`), `useSnackbar`, `cn`, `omit`, `prepareForSlot` |

### Icons

Around 180 icons ship on a dedicated subpath so you only pay for the ones you use — each is its own
module of roughly 0.5 KB:

```tsx
import { CloseIcon } from 'asma-ui-core/icons'
```

### Conventions worth knowing before you start

- **Body text is 16px (`text-base`)** on fields, selects, dropdown options and table bodies. The
  `size` prop changes height and padding, not font size. This matches the Figma spec — resist
  forcing `text-sm`. The Figma source for each component is linked from JSDoc (`@figmaNode` /
  `@figmaProp`); see [Figma ↔ React matching](#figma--react-matching).
- **Text colour depends on the surface.** Dropdown option rows are `text-delta-700`; the selected
  value in a closed field is `text-delta-800`; placeholders and floating labels are `text-delta-500`.
  If you pass custom `renderOption` / `renderLabel` / `renderValue` content, match the surface it
  renders into.
- **`dataTest` is required** on interactive form controls (`StyledCheckbox`, `StyledRadio`,
  `StyledSwitch`, …) — it drives end-to-end test selectors. Their `onChange` signature is
  `(event, checked)`.
- **Reach for `StyledDynamicSelect`** before hand-rolling a chip multi-select. It already handles tag
  chips with delete, `+N` overflow, checkbox option rows, a growing field and the trigger icon. It
  renders a chip group for ≤5 options and a searchable autocomplete for 6+.
- **Accessibility is part of the component contract** — roles, keyboard interaction and focus
  management ship with each component rather than being left to the call site.

### Browsing the components

```bash
git clone https://github.com/Carasent-ASMA/asma-ui-core.git
cd asma-ui-core && pnpm install && pnpm storybook
```

Storybook runs on `:6006` with docs, controls and an accessibility addon for every component.

---

## Figma ↔ React matching

The React components were matched to the ASMA Design System in Figma using **Figma node IDs** plus
**JSDoc comments** on the component and its props. That is the in-source contract for "this React
component is this Figma component, and this prop is this Figma property" — not tribal knowledge, and
not a separate mapping spreadsheet.

The Design System file is [`wXrXt5uKNNzV2DnQCgyYZH`](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH).

### How to read the mapping

Open any component source. Two JSDoc tags do the work:

| Tag | Where | Meaning |
| --- | --- | --- |
| `@figmaNode <fileKey>#<node-id>` | Once, on the component or its props type | The Figma component this React type maps to |
| `@figmaProp <FigmaProperty> = <value mapping>` | On each prop that has a Figma counterpart | How React values map onto Figma variant values |
| `@figmaProp none — <reason>` | On a prop with no Figma counterpart | Unmapped on purpose (`behavioral`, `a11y`, `ref`, `test hook`) — not forgotten |

Turn a node id into a Figma URL by replacing `-` with `:` in the node id:

`wXrXt5uKNNzV2DnQCgyYZH#13431-18852` →
https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH?node-id=13431-18852

```tsx
/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#13431-18852
 */
export type StyledButtonProps = …
interface commonProps {
    /** @figmaProp Size = medium→"Medium" (h40, text16/24) | small→"Small" (h32, text14/20) */
    size?: 'large' | 'small' | 'medium'
    /** @figmaProp none — test hook */
    dataTest: string
}
interface buttonStandartVariantsProps {
    /** @figmaProp Type = contained→"Primary (Contained)" | outlined→"Secondary (Outlined)" | text→"Tertiary" */
    variant?: 'contained' | 'outlined' | 'text' | …
    /** @figmaProp Danger = true→"on" | false→"off" */
    error?: boolean
}
```

Figma **State** (Enabled / Hovered / Focused / Pressed / Disabled) is usually **not** a React prop —
it is derived at runtime from native pseudo-classes and attributes. The JSDoc says so when that is
the case.

A component with no Design System counterpart is marked `@figmaNode none` with a reason, so the
absence is explicit.

### Why this exists

The tags were how the Figma-to-React parity pass was done: pull the node (size, radius, padding,
tokens, every variant × state), annotate every prop, then align the implementation until it matches.
The same tags are what you use when something "looks off" — open the node, compare the `@figmaProp`
mapping, and you know whether the call site is using the wrong prop or the component is drifting
from design.

The per-component ledger (node id, spec, states covered, remaining deltas) lives in
[`visual-tests/FIGMA-PARITY.md`](visual-tests/FIGMA-PARITY.md).

---

## Styling API

### `className` is the primary escape hatch

Pass Tailwind utilities directly. The whole library is built around this.

### `sx` works, but **flat keys only**

`sx` survives as a compatibility shim for the MUI-era API. [`resolveSx`](src/helpers/sx.ts) flattens
MUI's spacing shorthand and colour aliases into plain `CSSProperties`, so flat keys behave as you'd
expect: `mt`, `px`, `bgcolor`, `color`, `width`, `flex`, `minWidth`. Numeric spacing still uses MUI's
8px unit, so `mt: 2` is `16px`.

Anything **nested is dropped at runtime** with a `console.warn` and has no effect:

```tsx
// ❌ silently does nothing
//    logs: resolveSx: unsupported nested/responsive sx key "…" dropped
sx={{ '& .MuiInputBase-root': { minHeight: 80 }, '&:hover': { color: 'red' } }}

// ✅
className='min-h-20 hover:text-error-500'
```

That covers nested selectors, pseudo-classes, responsive arrays/objects and theme-callback functions.
`slotProps.input.sx` is likewise never read — the input slot takes `style` / `className` / `ref` only.

**Prefer `className` for new code.** `sx` exists to keep migrated call sites compiling.

### Two ordering footguns

These explain most "my override doesn't work" reports, so they are worth reading once up front.

**`cn` is plain clsx — it does not dedupe conflicting utilities.** tailwind-merge was deliberately
removed. If a component hardcodes `px-0` and you pass `p-4`, *both* land in the class list, and
Tailwind's own output order (axis utilities after shorthands) means the component's `px-0` wins. Your
override silently does nothing.

Where a default is meant to be overridable, the component gates it with
[`consumerOverrides`](src/helpers/classOverride.ts) — already applied to `StyledMenuList` padding,
the `StyledTabs` container inset, and `StyledChip` width. If you hit a default that is not yet gated,
that is a library fix worth raising, not something to hack around at the call site.

**The library's compiled CSS is `!important`.** Its utilities emit as `min-width: 0 !important` and
similar, which beat your *inline* `style` / `sx` / `slotProps`. Override with a class, not an inline
style. (If you are authoring components here: a layout default on an element consumers are expected
to size inline must be an inline-style default set before `resolveSx(...)`, never a utility class.)

---

## Theming

Themes are CSS custom properties switched by a `data-theme` attribute on a wrapping element, usually
`<body>`. There is no JS theme object and no provider:

```html
<body data-theme="fretex">
```

| `data-theme` | Theme |
| --- | --- |
| absent, or `default` | ASMA default (blue) |
| `fretex` | Fretex |
| `greenish` | Jade / green |

Each theme maps the semantic token scale — `alpha`, `beta`, `gama`, `delta`, `error` — onto concrete
palette values, and the Tailwind colour names reference those tokens. **Always use the semantic
names** (`text-delta-700`, `bg-alpha-500`); a raw palette colour like `text-blue-500` will not follow
the active theme.

---

## Bundle size and the MUI removal

MUI is an all-or-nothing dependency. Its runtime engine (`@mui/system`, `@mui/styled-engine`,
`@mui/utils`, `@emotion/*`, `stylis`) is shared by every MUI component, so keeping even one — the
Autocomplete, say — ships the entire ~143 KB gzipped infrastructure. There is no partial removal. The
same held for `@base-ui/react`, which was carrying ~143 KB gzipped to serve four simple components.

So both went, along with four smaller dependencies that were cheaper to inline than to keep:

| Removed | Was (gzipped) | Replaced by |
| --- | --- | --- |
| `@mui/material` | ~143 KB | Native HTML + ARIA components styled with Tailwind |
| `@base-ui/react` | ~143 KB | Native checkbox, switch, radio, accordion, dialog, tabs, slider, chip |
| `@emotion/react` + `@emotion/styled` | ~16 KB | Tailwind and CSS modules; flat `sx` via `resolveSx` |
| `lodash-es` | ~15 KB | Small native helpers |
| `tailwind-merge` | ~3 KB | `clsx`-only `cn()` plus `consumerOverrides` |
| `@react-input/mask` | ~3 KB | Dependency-free `useInputMask` |
| `material-ui-popup-state` | ~1 KB | In-repo `usePopupState` hook |

**~324 KB gzipped of dependencies became ~57 KB.** The only meaningful addition was
`@floating-ui/react` (~3 KB gzipped), which now powers tooltips, popovers, menus, drawers, selects
and the combobox.

### Measured output

From a clean `pnpm build` (600 preserved ESM modules):

| Artefact | Raw | Gzipped |
| --- | --- | --- |
| Library JS, whole package | 512 KB | **129 KB** |
| Library CSS | — | 22.5 KB |
| `index.js` barrel entry alone | 32 KB | 6.6 KB |

Down from roughly 1.2 MB before the rewrite.

**Your app downloads far less than 129 KB.** The build preserves ESM modules instead of emitting one
blob, so that figure is the whole-library footprint, not a per-consumer one. The barrel is pure
re-exports and module bodies load on demand. Icons are the clearest case: 41.8 KB gzipped in total,
but emitted as one module per icon, so importing one costs ~0.5 KB rather than the whole block.
Remaining subtrees, gzipped: non-icon components 45.1 KB, table 19.2 KB, date/time 11.9 KB.

Third-party runtime dependencies are deliberately **not** bundled into `dist` — they stay as bare
imports resolved by your bundler (or, inside ASMA, by a shared import map so several micro-frontends
load one copy). The numbers above are this library's own code only.

---

## Migrating from the MUI-era version

*Skip this section if you are adopting the library fresh.*

Published versions `^3.43.x` and earlier wrapped MUI. The rewrite deliberately preserved the public
prop surface, so **your code still compiles — it just renders wrong in specific places.** The
compiler catches almost none of it. Audit every input, select, chip and table call site.

1. **Dead `sx` selectors.** Every `'& .Mui*'`, nested, pseudo or responsive `sx` key stops applying.
   Watch the console for `resolveSx: unsupported nested/responsive sx key`.
2. **Chip `startAdornment` must be a real array.** A single wrapped element (`<div>{chips}</div>`)
   fails the internal `Array.isArray` check, so the field stays a fixed 40px row and chips overlap.
   Pass `[...chips]` and drop `multiline`.
3. **Fields pin to 235px without `fullWidth`**, and `StyledFormControl` defaults to `inline-flex`, so
   a form that used to fill its container now collapses. Pass `fullWidth` on **both**.
4. **Text moved to 16px** on fields, selects and table bodies. Intended — re-baseline your visual
   snapshots rather than forcing `text-sm`.
5. **Direct `@mui/material` imports must be swapped** for the `Styled*` equivalents. `Checkbox` →
   `StyledCheckbox`, `FormControlLabel` → `StyledFormControlLabel`, `Radio` / `Switch` / `Tooltip`
   likewise. Note the `(event, checked)` handler shape and required `dataTest`.
6. **Some `slotProps` shapes narrowed** — these *do* fail `tsc`. `StyledMenu`'s `slotProps.root` is
   gone; only `paper` remains.

> **Breaking change:** `@mui/material` is no longer a dependency or peer dependency. An app that
> imports MUI directly must now declare it itself.

**Verifying a bump:** `tsc --noEmit` is necessary but far from sufficient. Also confirm the browser
console is free of `resolveSx` warnings, and visually check every touched field in its empty,
one-chip, many-chip, disabled, error and read-only states.

ASMA engineers: the full audit procedure, detection greps and per-recipe worked fixes live in the
`ui-core-mui-free-migration` skill in the `asma-modules` monorepo
(`.github/skills/ui-core-mui-free-migration/SKILL.md`).

---

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Console: `resolveSx: unsupported nested/responsive sx key … dropped` | Nested `sx` is not supported. Move it to `className`. |
| My `className` override does nothing | `cn` is plain clsx with no dedupe, so the component's hardcoded utility wins on source order. The default needs a `consumerOverrides` gate — raise it. |
| My inline `style` / `sx` is ignored | The library's CSS is `!important`. Override with a class instead. |
| Every field is ~235px and the form collapsed | Pass `fullWidth` on both `StyledInputField` **and** the wrapping `StyledFormControl`. |
| Chips overlap the input, field won't grow | `startAdornment` must be an **array**, not a single wrapped element. Remove `multiline`. |
| Popover or calendar shows a black UA border | `dist/style.css` isn't imported. It carries the required `[popover]` reset. |
| Nothing is styled at all | Same — the stylesheet import is missing, or lands after Tailwind. |
| Text is 16px where it used to be 14px | Intended Figma parity. Don't force `text-sm`. |
| Select/menu inside a `StyledDialog` can't be clicked | Fixed in later versions — modal `<dialog>` marks outside content inert, so the popover must portal into the dialog. Upgrade. |
| Stray dark tooltip bubble on hover | `title={cond && 'text'}` yielded `false`. Fixed in later versions; upgrade. |
| A library fix isn't showing after rebuilding | Apps consume the prebuilt `dist`, not `src`. See the note below. |

**The `dist` trap (monorepo work only).** If you are developing this library alongside a consuming
app, your change is invisible until you rebuild (`pnpm --filter asma-ui-core build`) and restart the
app's dev server with `vite --force`. Worse, with peer dependencies pnpm injects a *snapshot copy*
into its virtual store rather than symlinking, so rebuilding `dist` never reaches the app and
`pnpm install` reports "Already up to date". Re-sync explicitly:

```bash
RESOLVED=$(readlink -f node_modules/asma-ui-core)
rsync -a --delete shared/asma-ui-core/dist/ "$RESOLVED/dist/"
```

Check the `dist` mtime before debugging anything else.

---

## Contributing to the library

```bash
pnpm install
pnpm storybook        # component workbench on :6006
pnpm build            # ts:check + vite build into dist/
pnpm ts:check         # types only
pnpm lint             # eslint (lint:fix to autofix)
pnpm test-storybook   # vitest against the stories
pnpm vrt              # visual regression vs committed baselines (needs Docker)
pnpm vrt:accept       # re-baseline after an intended visual change
pnpm vrt:report       # open the last Playwright report
```

Node 24 is required (see `engines`).

### Component conventions

- Compose from existing styled components; check whether one already exists before styling from
  scratch.
- Question whether a new "composed component" is needed at all — often documenting how to combine
  the existing parts is enough.
- Every component is documented and tested in Storybook **before** the PR opens.
- New or restyled components get the `@figmaNode` / `@figmaProp` JSDoc contract described in
  [Figma ↔ React matching](#figma--react-matching) — including `@figmaProp none` when a prop has no
  Design System counterpart.
- Accessibility ships with the component: role, keyboard behaviour and focus management, not a
  follow-up ticket.

### The export surface is frozen

`src/api-surface.test.ts` snapshots every runtime export of the barrel. If that snapshot changes you
have made a breaking API change, and it must be a deliberate reviewed decision rather than an
incidental side effect of a refactor. `src/index.ts` is maintained by hand — add new exports there
explicitly.

### Visual regression

Storybook stories are captured and compared inside a pinned Playwright Docker image, so local and CI
runs share one code path. A diff fails the build until a human confirms it is an intended design
change, at which point `pnpm vrt:accept` rewrites the baselines. Per-component Figma parity decisions
are tracked in [`visual-tests/FIGMA-PARITY.md`](visual-tests/FIGMA-PARITY.md).

### Changelog and releases

The project uses [changesets](https://github.com/changesets/changesets). For each feature or fix:

```bash
npx changeset
```

Choose `patch` for a fix, `minor` for a feature, `major` for a breaking change, and commit the
generated markdown file with your PR. A PR may carry several changesets. On merge to master the
pipeline bumps the version, writes the changelog and publishes to npm.
