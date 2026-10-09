import { useId } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
import { cn } from 'src/helpers/cn'
import type { DynamicSelectOption, StyledDynamicSelectProps } from '../types'

type DynamicSelectReadOnlyValueProps<TOption extends DynamicSelectOption> = Pick<
    StyledDynamicSelectProps<TOption>,
    'dataTest' | 'options' | 'title' | 'valueKey' | 'labelKey' | 'renderLabel' | 'readOnlyReason'
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
    valueKey = 'value' as DynamicSelectReadOnlyValueProps<TOption>['valueKey'],
    labelKey = 'label' as DynamicSelectReadOnlyValueProps<TOption>['labelKey'],
    renderLabel,
    readOnlyReason,
}: DynamicSelectReadOnlyValueProps<TOption>): JSX.Element => {
    const titleId = useId()
    const reasoned = Boolean(readOnlyReason)
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
            {/* With a reason the value is a focusable read-only field, so the reason reaches the
                keyboard and screen readers too (disabled-states DIS-6). */}
            <StyledTooltip
                title={readOnlyReason}
                open={reasoned ? undefined : false}
                openOnTap={reasoned}
                persistentDescription={reasoned}
            >
                <div
                    data-testid={`${dataTest}-read-only-value`}
                    role={reasoned ? 'textbox' : undefined}
                    aria-readonly={reasoned ? true : undefined}
                    aria-labelledby={reasoned && title ? titleId : undefined}
                    tabIndex={reasoned ? 0 : undefined}
                    className={cn(
                        'text-base/6 text-delta-700',
                        reasoned &&
                            'w-fit cursor-default rounded outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus-ring',
                    )}
                >
                    {selected === null ? '-' : renderLabel ? renderLabel(selected) : getOptionLabel(selected)}
                </div>
            </StyledTooltip>
        </div>
    )
}
