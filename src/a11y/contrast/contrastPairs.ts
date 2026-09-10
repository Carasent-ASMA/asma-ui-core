/**
 * The colour pairs this library actually puts on screen, as a data table.
 *
 * Every row cites the component file that pairs the two tokens, so a reviewer can check the claim
 * without trusting the table. Tokens are cited by NAME, never by line number — `src/styles/**` is
 * ASMA-8133's area and its line numbers move.
 *
 * Rows with a `finding` are measured failures against master. They are quarantined, not fixed:
 * changing a token value is a visual (potentially breaking) change to a brand theme and needs
 * design sign-off, so each one is written up in `docs/a11y-contrast.md` and escalated instead.
 *
 * @see docs/a11y-contrast.md — findings register, exemption rationale, measured ratios
 * @see docs/a11y-allowlist.md — the axe (SC 1.4.3 only) story baseline this cross-references
 */

/**
 * The surface the library composites onto when a token is `transparent`, and the surface an
 * unparented control is assumed to sit on. The library ships no page-background token; every
 * component that sets its own opaque surface (input, tooltip, chip) uses white or a delta tint.
 */
export const APP_SURFACE = '#ffffff'

export const REQUIREMENT_RATIO = {
    /** SC 1.4.3, body text below 18.66px bold / 24px regular. */
    text: 4.5,
    /** SC 1.4.3, large text at or above that size. */
    largeText: 3,
    /** SC 1.4.11, UI component boundaries, state indicators and focus rings. */
    nonText: 3,
} as const

export type ContrastRequirement = keyof typeof REQUIREMENT_RATIO

export interface ContrastPair {
    /** Stable id. Quarantined rows use it to join to `docs/a11y-contrast.md`. */
    readonly id: string
    /** Custom-property name, or a literal colour for a hard-coded component value. */
    readonly foreground: string
    readonly background: string
    readonly requirement: ContrastRequirement
    /** Repo-relative path of the component that pairs these two. */
    readonly usedBy: string
    /** Findings id in docs/a11y-contrast.md. Present means "measured failing, quarantined". */
    readonly finding?: string
}

/**
 * Hand-curated pairs. The button token family is generated instead — see `buildButtonPairs`.
 */
export const COMPONENT_PAIRS: readonly ContrastPair[] = [
    // ---------------------------------------------------------------- text (SC 1.4.3)
    {
        id: 'input/value',
        foreground: '--colors-input-active-text-color',
        background: '--colors-input-active-bg-color',
        requirement: 'text',
        usedBy: 'src/components/inputs/field-styles.ts',
    },
    {
        id: 'input/placeholder',
        foreground: '--colors-input-active-placeholder-color',
        background: '--colors-input-active-bg-color',
        requirement: 'text',
        usedBy: 'src/components/inputs/field-styles.ts',
        finding: 'F-01',
    },
    {
        id: 'input/label',
        foreground: '--colors-input-label-active-text-color',
        background: '--colors-input-active-bg-color',
        requirement: 'text',
        usedBy: 'src/components/inputs/field-styles.ts',
    },
    {
        id: 'input/description',
        foreground: '--colors-input-description-active-text-color',
        background: '--colors-input-active-bg-color',
        requirement: 'text',
        usedBy: 'src/components/inputs/field-styles.ts',
    },
    {
        id: 'input/label-focused',
        foreground: '--colors-gama-500',
        background: '--colors-input-active-bg-color',
        requirement: 'text',
        usedBy: 'src/components/inputs/field-styles.ts',
    },
    {
        id: 'input/not-editable-value',
        foreground: '--colors-input-notEditable-text-color',
        background: '--colors-input-notEditable-bg-color',
        requirement: 'text',
        usedBy: 'src/components/inputs/field-styles.ts',
    },
    {
        id: 'input/error-value',
        foreground: '--colors-input-error-text-color',
        background: '--colors-input-error-bg-color',
        requirement: 'text',
        usedBy: 'src/components/inputs/field-styles.ts',
        finding: 'F-02',
    },
    {
        id: 'menu-item/enabled',
        foreground: '--colors-delta-700',
        background: APP_SURFACE,
        requirement: 'text',
        usedBy: 'src/components/navigation/menu/StyledMenuItem.tsx',
    },
    {
        id: 'menu-item/hover',
        foreground: '--colors-delta-700',
        background: '--colors-delta-50',
        requirement: 'text',
        usedBy: 'src/components/navigation/menu/StyledMenuItem.tsx',
    },
    {
        id: 'menu-item/selected',
        foreground: '--colors-delta-700',
        background: '--colors-gama-50',
        requirement: 'text',
        usedBy: 'src/components/navigation/menu/StyledMenuItem.tsx',
    },
    {
        id: 'chip/label',
        foreground: '--colors-delta-700',
        background: APP_SURFACE,
        requirement: 'text',
        usedBy: 'src/components/data-display/chip/StyledChip.tsx',
    },
    {
        id: 'chip/label-hover',
        foreground: '--colors-delta-700',
        background: '--colors-gama-25',
        requirement: 'text',
        usedBy: 'src/components/data-display/chip/StyledChip.tsx',
    },
    {
        id: 'chip/remove-button',
        foreground: '--colors-delta-700',
        background: '--colors-delta-50',
        requirement: 'text',
        usedBy: 'src/components/data-display/chip/StyledChip.tsx',
    },
    {
        id: 'tab/selected',
        foreground: '--colors-gama-500',
        background: APP_SURFACE,
        requirement: 'text',
        usedBy: 'src/components/navigation/tabs/StyledTab.tsx',
    },
    {
        id: 'tab/inactive',
        foreground: '--colors-delta-600',
        background: APP_SURFACE,
        requirement: 'text',
        usedBy: 'src/components/navigation/tabs/StyledTab.tsx',
    },
    {
        id: 'link/enabled',
        foreground: '--colors-gama-500',
        background: APP_SURFACE,
        requirement: 'text',
        usedBy: 'src/components/navigation/link/StyledLink.module.scss',
    },
    {
        id: 'link/hover',
        foreground: '--colors-gama-600',
        background: APP_SURFACE,
        requirement: 'text',
        usedBy: 'src/components/navigation/link/StyledLink.module.scss',
    },
    {
        id: 'table/cell-text',
        foreground: '--colors-delta-800',
        background: APP_SURFACE,
        requirement: 'text',
        usedBy: 'src/table/shared-components/StyledMenuItem.tsx',
    },
    {
        id: 'tooltip/label',
        // Tooltip hard-codes both colours rather than using tokens, so this pair is theme-invariant.
        foreground: '#ffffff',
        background: '#363E4A',
        requirement: 'text',
        usedBy: 'src/components/data-display/tooltip/StyledTooltip.tsx',
    },
    {
        id: 'snackbar/info-message',
        foreground: '--colors-link-text-standart',
        background: '--colors-theta-700',
        requirement: 'text',
        usedBy: 'src/components/feedback/snack-bar/processInfoSnackbar.ts',
        finding: 'F-06',
    },

    // ------------------------------------------------- alert, standard (SC 1.4.3 + 1.4.11)
    ...(['success', 'info', 'warning', 'error'] as const).flatMap((severity): ContrastPair[] => [
        {
            id: `alert/standard-${severity}-body`,
            foreground: '--colors-delta-800',
            background: `--colors-${severity}-50`,
            requirement: 'text',
            usedBy: 'src/components/feedback/snack-bar/StyledAlert.tsx',
        },
        {
            // The standard variant's body is neutral, so the severity-700 icon is the only thing
            // carrying severity — a graphic required to understand the content, SC 1.4.11.
            id: `alert/standard-${severity}-icon`,
            foreground: `--colors-${severity}-700`,
            background: `--colors-${severity}-50`,
            requirement: 'nonText',
            usedBy: 'src/components/feedback/snack-bar/StyledAlert.tsx',
        },
        {
            id: `alert/outlined-${severity}-text`,
            foreground: `--colors-${severity}-700`,
            background: APP_SURFACE,
            requirement: 'text',
            usedBy: 'src/components/feedback/snack-bar/StyledAlert.tsx',
        },
    ]),
    {
        id: 'alert/filled-success-text',
        foreground: '#ffffff',
        background: '--colors-success-500',
        requirement: 'text',
        usedBy: 'src/components/feedback/snack-bar/StyledAlert.tsx',
        finding: 'F-03',
    },
    {
        id: 'alert/filled-info-text',
        foreground: '#ffffff',
        background: '--colors-info-500',
        requirement: 'text',
        usedBy: 'src/components/feedback/snack-bar/StyledAlert.tsx',
        finding: 'F-04',
    },
    {
        id: 'alert/filled-warning-text',
        foreground: '#ffffff',
        background: '--colors-warning-500',
        requirement: 'text',
        usedBy: 'src/components/feedback/snack-bar/StyledAlert.tsx',
        finding: 'F-05',
    },
    {
        id: 'alert/filled-error-text',
        foreground: '#ffffff',
        background: '--colors-error-600',
        requirement: 'text',
        usedBy: 'src/components/feedback/snack-bar/StyledAlert.tsx',
    },

    // ------------------------------------------------------------ non-text (SC 1.4.11)
    {
        id: 'input/border-enabled',
        foreground: '--colors-input-active-outline-color',
        background: '--colors-input-active-bg-color',
        requirement: 'nonText',
        usedBy: 'src/components/inputs/field-styles.ts',
    },
    {
        id: 'input/border-hover',
        foreground: '--colors-input-active-hover-outline-color',
        background: '--colors-input-active-bg-color',
        requirement: 'nonText',
        usedBy: 'src/components/inputs/field-styles.ts',
        finding: 'F-08',
    },
    {
        id: 'input/focus-ring',
        foreground: '--colors-input-active-focus-outline-color',
        background: '--colors-input-active-bg-color',
        requirement: 'nonText',
        usedBy: 'src/components/inputs/field-styles.ts',
        finding: 'F-07',
    },
    {
        id: 'input/border-error',
        foreground: '--colors-input-error-outline-color',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/inputs/field-styles.ts',
    },
    {
        id: 'checkbox/border-unchecked',
        foreground: '--colors-delta-500',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/inputs/checkbox/base-ui/StyledCheckbox.module.scss',
    },
    {
        id: 'checkbox/fill-checked',
        foreground: '--colors-gama-500',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/inputs/checkbox/base-ui/StyledCheckbox.module.scss',
    },
    {
        id: 'checkbox/tick-on-fill',
        foreground: '#ffffff',
        background: '--colors-gama-500',
        requirement: 'nonText',
        usedBy: 'src/components/inputs/checkbox/base-ui/StyledCheckbox.module.scss',
    },
    {
        id: 'checkbox/border-error',
        foreground: '--colors-error-500',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/inputs/checkbox/base-ui/StyledCheckbox.module.scss',
    },
    {
        id: 'switch/track-off',
        foreground: '--colors-delta-400',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/inputs/switch/base-ui/StyledSwitch.module.scss',
        finding: 'F-09',
    },
    {
        id: 'switch/track-on',
        foreground: '--colors-gama-500',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/inputs/switch/base-ui/StyledSwitch.module.scss',
    },
    {
        id: 'switch/knob-on-track',
        foreground: '#ffffff',
        background: '--colors-gama-500',
        requirement: 'nonText',
        usedBy: 'src/components/inputs/switch/base-ui/StyledSwitch.module.scss',
    },
    {
        id: 'switch/focus-ring',
        foreground: '--colors-gama-400',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/inputs/switch/base-ui/StyledSwitch.module.scss',
        finding: 'F-07',
    },
    {
        id: 'switch/track-read-only',
        foreground: '--colors-delta-300',
        background: '--colors-delta-10',
        requirement: 'nonText',
        usedBy: 'src/components/inputs/switch/base-ui/StyledSwitch.module.scss',
        finding: 'F-10',
    },
    {
        id: 'chip/border-enabled',
        foreground: '--colors-delta-300',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/data-display/chip/StyledChip.tsx',
        finding: 'F-11',
    },
    {
        id: 'chip/focus-ring',
        foreground: '--colors-gama-400',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/data-display/chip/StyledChip.tsx',
        finding: 'F-07',
    },
    {
        id: 'link/focus-ring',
        foreground: '--colors-gama-400',
        background: APP_SURFACE,
        requirement: 'nonText',
        usedBy: 'src/components/navigation/link/StyledLink.module.scss',
        finding: 'F-07',
    },
]

/**
 * `StyledButton.module.scss` builds every button from a single mixin over
 * `--colors-button-{type}-{color}-{state}-{text|bg|border}-color`, so the button pairs are
 * generated from the token names rather than transcribed. A new variant or state added to the
 * token files is contrast-checked the moment it lands, with no edit here.
 */
export const BUTTON_TYPES = ['contained', 'outlined', 'text', 'textGray', 'textWhite'] as const
export const BUTTON_COLORS = ['common', 'error'] as const
/**
 * `disabled` is deliberately absent. SC 1.4.3 exempts "text ... that is part of an inactive user
 * interface component", and 1.4.11 exempts inactive components in the same words. See the
 * exemptions section of docs/a11y-contrast.md.
 */
export const BUTTON_STATES = ['base', 'hover', 'active', 'focused'] as const

export type ButtonType = (typeof BUTTON_TYPES)[number]
export type ButtonState = (typeof BUTTON_STATES)[number]

export interface ButtonTokenNames {
    readonly text: string
    readonly background: string
    readonly border: string
}

export const buttonTokenNames = (
    type: ButtonType,
    color: (typeof BUTTON_COLORS)[number],
    state: ButtonState,
): ButtonTokenNames => {
    const statePrefix = state === 'base' ? '' : `${state}-`
    const base = `--colors-button-${type}-${color}-${statePrefix}`

    return { text: `${base}text-color`, background: `${base}bg-color`, border: `${base}border-color` }
}

/**
 * Types whose boundary is a designed, always-present edge. `text` / `textGray` are borderless by
 * design — the label carries the affordance and is held to 4.5:1, which is what SC 1.4.11's
 * "visual information required to identify user interface components" asks for. `textWhite` is
 * excluded from contrast assertions entirely: it is white-on-transparent, meant to be placed on a
 * consumer-supplied dark surface this package never sees. Documented in docs/a11y-contrast.md.
 */
export const BUTTON_TYPES_WITH_BOUNDARY: readonly ButtonType[] = ['contained', 'outlined']
export const BUTTON_TYPES_WITHOUT_KNOWN_SURFACE: readonly ButtonType[] = ['textWhite']

/**
 * Button pairs that fail against master, keyed `{type}/{color}/{state}/{aspect}`.
 *
 * `text-on-tinted-hover` (F-12): outlined/text/textGray put gama-500 on a gama-50 or gama-100 tint
 * at hover and active, which drops the label under 4.5:1 in every theme.
 * `boundary-focus` (F-07): the focus border is gama-400 everywhere, which is under 3:1 on white in
 * default and fretex.
 * `boundary-outlined-hover` (F-13): outlined's hover/active border is gama-300, under 3:1 in all
 * three themes.
 * `outlined/error/focused/text` (F-16): white label on a beta-100 tint, 1.27:1 in every theme.
 * Error/focused boundaries now resolve after ASMA-8133. Default and greenish pass at 8.37:1;
 * fretex still uses gama-400 at 2.24:1, so these rows remain under F-07.
 */
export const BUTTON_FINDINGS: Readonly<Record<string, string>> = {
    'outlined/common/hover/text': 'F-12',
    'outlined/common/active/text': 'F-12',
    'outlined/common/focused/text': 'F-12',
    'text/common/hover/text': 'F-12',
    'text/common/active/text': 'F-12',
    'text/common/focused/text': 'F-12',
    'textGray/common/hover/text': 'F-12',
    'textGray/common/active/text': 'F-12',
    'textGray/common/focused/text': 'F-12',
    'contained/common/focused/boundary': 'F-07',
    'outlined/common/focused/boundary': 'F-07',
    'outlined/common/hover/boundary': 'F-13',
    'outlined/common/active/boundary': 'F-13',
    'outlined/error/focused/text': 'F-16',
    'contained/error/focused/boundary': 'F-07',
    'outlined/error/focused/boundary': 'F-07',
}

/**
 * Regression floors for the quarantined pairs: the ratio each one measures on master, per theme.
 *
 * A quarantined pair is asserted against its floor rather than against the WCAG threshold, so the
 * suite still detects *decay* on an already-failing pair while staying green if ASMA-8133 or a
 * design fix legitimately *improves* the number. This is a characterization test — the floor is a
 * record of the status quo, not a standard. The real target stays in docs/a11y-contrast.md against
 * the finding id, and lifting a quarantine means deleting the pair's `finding` key so the live SC
 * assertion takes over.
 *
 * `null` means the pair has no computed value at all — see F-15, where the `var()` chain is
 * dangling so the browser drops the declaration outright. A floor is meaningless there, so those
 * stay skipped.
 *
 * Values are produced by `contrastRatio`, which already truncates to two decimals, so the floor and
 * the measurement are byte-identical and the comparison needs no epsilon. Use
 * printRegressionFloors.ts to inspect current measurements; review changes before updating floors.
 */
export const REGRESSION_FLOORS: Readonly<Record<string, Readonly<Record<string, number | null>>>> = {
    'input/placeholder': { default: 3.55, fretex: 5.57, greenish: 3.55 },
    'input/error-value': { default: 3.88, fretex: 3.88, greenish: 3.88 },
    'snackbar/info-message': { default: 6.28, fretex: 3.55, greenish: 11.52 },
    'alert/filled-success-text': { default: 1.95, fretex: 1.95, greenish: 1.95 },
    'alert/filled-info-text': { default: 3.18, fretex: 3.18, greenish: 3.18 },
    'alert/filled-warning-text': { default: 1.61, fretex: 1.61, greenish: 1.61 },
    'input/border-hover': { default: 2.33, fretex: 1.81, greenish: 2.2 },
    'input/focus-ring': { default: 2.73, fretex: 2.24, greenish: 3.15 },
    'switch/track-off': { default: 2.29, fretex: 5.57, greenish: 2.29 },
    'switch/focus-ring': { default: 2.73, fretex: 2.24, greenish: 3.15 },
    'switch/track-read-only': { default: 1.68, fretex: 1.98, greenish: 1.68 },
    'chip/border-enabled': { default: 1.75, fretex: 2.07, greenish: 1.75 },
    'chip/focus-ring': { default: 2.73, fretex: 2.24, greenish: 3.15 },
    'link/focus-ring': { default: 2.73, fretex: 2.24, greenish: 3.15 },
    'outlined/common/hover/text': { default: 3.55, fretex: 3.83, greenish: 4.21 },
    'outlined/common/active/text': { default: 4.04, fretex: 4.23, greenish: 3.55 },
    'outlined/common/focused/text': { default: 4.04, fretex: 4.23, greenish: 4.21 },
    'text/common/hover/text': { default: 4.04, fretex: 4.23, greenish: 4.21 },
    'text/common/active/text': { default: 3.55, fretex: 3.83, greenish: 3.55 },
    'text/common/focused/text': { default: 4.04, fretex: 4.23, greenish: 4.21 },
    'textGray/common/hover/text': { default: 4.04, fretex: 4.23, greenish: 4.21 },
    'textGray/common/active/text': { default: 3.55, fretex: 3.83, greenish: 3.55 },
    'textGray/common/focused/text': { default: 4.04, fretex: 4.23, greenish: 4.21 },
    'contained/common/focused/boundary': { default: 2.73, fretex: 2.24, greenish: 3.15 },
    'outlined/common/focused/boundary': { default: 2.73, fretex: 2.24, greenish: 3.15 },
    'outlined/common/hover/boundary': { default: 2.33, fretex: 1.81, greenish: 2.2 },
    'outlined/common/active/boundary': { default: 2.33, fretex: 1.81, greenish: 2.2 },
    'outlined/error/focused/text': { default: 1.27, fretex: 1.27, greenish: 1.27 },
    'contained/error/focused/boundary': { default: 8.37, fretex: 2.24, greenish: 8.37 },
    'outlined/error/focused/boundary': { default: 8.37, fretex: 2.24, greenish: 8.37 },
}
