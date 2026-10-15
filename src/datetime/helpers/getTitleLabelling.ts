import type { AriaAttributes } from 'react'

/**
 * ARIA naming for a datetime input that shows its `title` as plain text above the field: points the
 * input at the title unless a floating `label` or an explicit name in `inputAriaProps` already names it
 * (`aria-labelledby` would otherwise override that name). `inputAriaProps` are spread last.
 */
export const getTitleLabelling = ({
    title,
    titleId,
    label,
    inputAriaProps,
}: {
    title?: string
    titleId: string
    label?: string
    inputAriaProps?: AriaAttributes
}): AriaAttributes => {
    const hasOwnName = !!label || !!inputAriaProps?.['aria-label'] || !!inputAriaProps?.['aria-labelledby']
    return {
        ...(title && !hasOwnName ? { 'aria-labelledby': titleId } : {}),
        ...inputAriaProps,
    }
}
