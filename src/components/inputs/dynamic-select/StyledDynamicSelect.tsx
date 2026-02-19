import { DynamicInteractiveChipGroup } from './components/DynamicInteractiveChipGroup'
import { DynamicSelectAutocomplete } from './components/DynamicSelectAutocomplete'
import type { DynamicSelectOption, StyledDynamicSelectComponent, StyledDynamicSelectProps } from './types'
import { forwardRef } from 'react'

export const StyledDynamicSelect = forwardRef(
    <TOption extends DynamicSelectOption>(
        props: StyledDynamicSelectProps<TOption>,
        ref: React.Ref<HTMLInputElement>,
    ) => {
        const { options } = props

        if (options.length > 0 && options.length <= 5)
            return <DynamicInteractiveChipGroup<TOption> {...props} ref={ref} />

        return <DynamicSelectAutocomplete<TOption> {...props} ref={ref} />
    },
) as StyledDynamicSelectComponent
