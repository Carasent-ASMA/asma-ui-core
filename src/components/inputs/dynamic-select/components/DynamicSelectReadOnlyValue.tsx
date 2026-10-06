import { cn } from 'src/helpers/cn'
import type { DynamicSelectOption, StyledDynamicSelectProps } from '../types'

type DynamicSelectReadOnlyValueProps<TOption extends DynamicSelectOption> = Pick<
    StyledDynamicSelectProps<TOption>,
    'dataTest' | 'options' | 'title' | 'size' | 'valueKey' | 'labelKey' | 'renderLabel'
> & {
    value: TOption | null
}

/**
 * Read-only **single** select: the selected option as plain text under the title — no chip, no
 * input field, no helper/error row (there is nothing to validate). Applies whatever the option
 * count, so the ≤5 chip variant and the 6+ autocomplete variant read the same.
 *
 * Text = Body Base 16/24 `text-icon/body` (delta-700); 14/20 at `size='small'`. No value → `-`, the
 * same placeholder the chip variant shows. Multiple selects never reach this component.
 */
export const DynamicSelectReadOnlyValue = <TOption extends DynamicSelectOption>({
    dataTest,
    options,
    value,
    title,
    size = 'medium',
    valueKey = 'value' as DynamicSelectReadOnlyValueProps<TOption>['valueKey'],
    labelKey = 'label' as DynamicSelectReadOnlyValueProps<TOption>['labelKey'],
    renderLabel,
}: DynamicSelectReadOnlyValueProps<TOption>): JSX.Element => {
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
            {title && <span className='text-base font-semibold text-delta-800'>{title}</span>}
            <div
                data-testid={`${dataTest}-read-only-value`}
                className={cn('text-delta-700', size === 'small' ? 'text-sm/5' : 'text-base/6')}
            >
                {selected === null ? '-' : renderLabel ? renderLabel(selected) : getOptionLabel(selected)}
            </div>
        </div>
    )
}
