/**
 * Reliable consumer overrides for hardcoded layout defaults, WITHOUT tailwind-merge.
 *
 * `cn` is plain clsx (tailwind-merge was deliberately dropped in Phase 0), so it only concatenates —
 * it does not dedupe conflicting utilities. When a component hardcodes a default like `px-4` and a
 * consumer passes `className='px-0'`, BOTH land in the class list and Tailwind emits them in its own
 * fixed order (not DOM order), so the consumer's class does not reliably win. The curated-library fix
 * is per-component: DROP the hardcoded default for an axis when the consumer already sets that axis.
 *
 * Usage — gate each hardcoded default by the axis it occupies:
 *   cn('base', !consumerOverrides(className, 'padding-x') && 'px-4', className)
 *
 * See the `ui-core-mui-free-migration` skill ("consumer className can't override a component default").
 */

/** The layout axes a component default can occupy and a consumer can legitimately override. */
export type ClassAxis = 'padding' | 'padding-x' | 'padding-y' | 'margin' | 'width' | 'display'

// Each pattern matches a Tailwind utility on that axis, with an optional `!` important prefix.
// `padding-x` also matches the `p-` shorthand (it sets horizontal padding too); likewise `padding-y`.
const AXIS_PATTERN: Record<ClassAxis, RegExp> = {
    padding: /(?:^|\s)!?p[xytrblse]?-/, // any padding utility (p / px / py / pt / pr / pb / pl / ps / pe)
    'padding-x': /(?:^|\s)!?p[xlrse]?-/, // horizontal-affecting only (p / px / pl / pr / ps / pe)
    'padding-y': /(?:^|\s)!?p[ytb]?-/, // vertical-affecting only (p / py / pt / pb)
    margin: /(?:^|\s)!?-?m[xytrblse]?-/, // any margin utility (allows the negative `-m…` prefix)
    width: /(?:^|\s)!?w-/,
    display: /(?:^|\s)!?(?:block|inline-block|inline-flex|inline|flex|grid|contents|hidden|table)(?:\s|$)/,
}

/**
 * True when `className` already sets a utility on `axis` — so the component should omit its own
 * hardcoded default for that axis and let the consumer's class take effect.
 */
export const consumerOverrides = (className: string | undefined, axis: ClassAxis): boolean =>
    !!className && AXIS_PATTERN[axis].test(className)
