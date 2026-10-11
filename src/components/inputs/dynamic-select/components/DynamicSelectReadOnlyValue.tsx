import { useId } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
import { cn } from 'src/helpers/cn'
import type { DynamicSelectOption, StyledDynamicSelectProps } from '../types'

type DynamicSelectReadOnlyValueProps<TOption extends DynamicSelectOption> = Pick<
    StyledDynamicSelectProps<TOption>,
    'dataTest' | 'options' | 'title' | 'ariaLabel' | 'valueKey' | 'labelKey' | 'renderLabel' | 'readOnlyReason'
> & {
    value: TOption | null
}

/**
 * Read-only **single** select: the selected option as plain text under the title — no chip, no
 * input field, no helper/error row (there is nothing to validate). Applies whatever the option
 * count, so the ≤5 chip variant and the 6+ autocomplete variant read the same.
 *
 * Text = Body Base 16/24 `text-icon/body` (delta-700) at every `size`: `size` scales chips and
 * buttons, and read-only draws neither. No value → `-`, the same placeholder the chip variant shows.
 * Multiple selects never reach this component.
 */
export const DynamicSelectReadOnlyValue = <TOption extends DynamicSelectOption>({
    dataTest,
    options,
    value,
    title,
    ariaLabel,
    valueKey = 'value' as DynamicSelectReadOnlyValueProps<TOption>['valueKey'],
    labelKey = 'label' as DynamicSelectReadOnlyValueProps<TOption>['labelKey'],
    renderLabel,
    readOnlyReason,
}: DynamicSelectReadOnlyValueProps<TOption>): JSX.Element => {
    const titleId = useId()
    const reasoned = Boolean(readOnlyReason)
    /* The reason makes the value a focusable read-only field (DIS-6), but only when something can
     * name it: a `role="textbox"` without an accessible name is an axe violation
     * (`aria-input-field-name`) and worse than the plain text it replaced. The visible `title`
     * names it; `ariaLabel` names it when no title is rendered. With neither, the value stays
     * plain text and the reason is rendered as visible text below it — a hover/focus/tap tooltip
     * on a node the keyboard cannot reach would never be announced (DIS-2). */
    const field = reasoned && (Boolean(title) || Boolean(ariaLabel))
    const getOptionValue = (option: TOption | null) => {
        if (typeof option === 'object') return option?.[valueKey as keyof TOption]
        return option
    }

    const getOptionLabel = (option: TOption): string => {
        if (typeof option === 'object') return option?.[labelKey as keyof TOption]?.toString() ?? ''
        return option?.toString() ?? ''
    }

    // Prefer the matching entry from `options`, as the chip variant does — a value object may carry
    // only its identity key, while the option holds the label.
    const selected =
        value === null || value === undefined
            ? null
            : (options.find((option) => getOptionValue(option) === getOptionValue(value)) ?? value)

    return (
        <div data-testid={`${dataTest}-read-only`} className='flex flex-col gap-y-1'>
            {title && (
                <span id={titleId} className='text-base font-semibold text-delta-800'>
                    {title}
                </span>
            )}
            {/* The reason reaches hover, focus and tap through the tooltip; a named field is also
                described by it for screen readers. Without a name the value stays plain text, so the
                reason is rendered as visible text beside it instead (disabled-states DIS-2, DIS-6). */}
            <StyledTooltip
                title={readOnlyReason}
                open={reasoned ? undefined : false}
                openOnTap={reasoned}
                persistentDescription={reasoned}
            >
                <div
                    data-testid={`${dataTest}-read-only-value`}
                    role={field ? 'textbox' : undefined}
                    aria-readonly={field ? true : undefined}
                    aria-labelledby={field && title ? titleId : undefined}
                    aria-label={field && !title ? ariaLabel : undefined}
                    tabIndex={field ? 0 : undefined}
                    className={cn(
                        'text-base/6 text-delta-700',
                        field &&
                            'w-fit cursor-default rounded outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus-ring',
                    )}
                >
                    {selected === null ? '-' : renderLabel ? renderLabel(selected) : getOptionLabel(selected)}
                </div>
            </StyledTooltip>
            {reasoned && !field && <span className='text-sm text-delta-600'>{readOnlyReason}</span>}
        </div>
    )
}
