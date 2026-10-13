import React, { forwardRef, useId, useMemo, useState, type HTMLAttributes } from 'react'
import { cn } from 'src/helpers/cn'
import { HelperRow } from 'src/helpers/HelperRow'
import { useHelperSlot } from 'src/helpers/useHelperSlot'
import { RadioGroupContext, type RadioValue } from './RadioGroupContext'

export type StyledRadioGroupProps = {
    value?: RadioValue
    defaultValue?: RadioValue
    onValueChange?: (value: RadioValue) => void
    disabled?: boolean
    /** Non-interactive but not visually disabled (e.g. a submitted/read-only questionnaire): the
     * current selection is shown but can't change. */
    readOnly?: boolean
    dataTest?: string
    error?: boolean
    errorText?: string
    helperText?: string
    reserveHelperText?: boolean
    children: React.ReactNode
    name?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>

/**
 * Native radio group (replaces `@base-ui/react`): a `role="radiogroup"` container that shares
 * name/selection with its `StyledRadio` children via context, controlled or uncontrolled, plus the
 * error/helper text row. TASK-201.
 */
export const StyledRadioGroup = forwardRef<HTMLDivElement, StyledRadioGroupProps>(
    (
        {
            value,
            defaultValue,
            onValueChange,
            disabled,
            readOnly,
            dataTest,
            error,
            errorText,
            helperText,
            reserveHelperText,
            children,
            name,
            ...rest
        },
        ref,
    ) => {
        const helperId = useId()
        const generatedName = useId()
        const groupName = name ?? generatedName

        const isControlled = value !== undefined
        const [uncontrolled, setUncontrolled] = useState<RadioValue>(defaultValue ?? null)
        const selected = isControlled ? value : uncontrolled

        const onSelect = (next: RadioValue) => {
            if (readOnly) return
            if (!isControlled) setUncontrolled(next)
            onValueChange?.(next)
        }

        const contextValue = useMemo(
            () => ({ name: groupName, value: selected, disabled, onSelect }),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [groupName, selected, disabled],
        )

        const message = error ? (errorText ?? helperText) : helperText
        const { show: showHelperSlot, role: helperAlertRole } = useHelperSlot('StyledRadioGroup', error, message, reserveHelperText, readOnly)

        // Let consumers pick the layout direction: our default `flex-col` is emitted through
        // `tailwind (important:true)` where `.flex-col` is authored after `.flex-row`, so a
        // consumer's `flex-row` in `className` would otherwise always lose. Only add the default
        // when the caller hasn't set a direction. `items-start` stops each labelled radio from being
        // stretched to the group's full width by the default `align-items: stretch` — the user asked
        // for fit-width radios that sit on one line rather than full-width rows on separate lines.
        const hasDirection = /\bflex-(?:row|col)\b/.test(rest.className ?? '')

        return (
            <div
                {...rest}
                ref={ref}
                role='radiogroup'
                data-testid={dataTest}
                aria-describedby={showHelperSlot ? helperId : undefined}
                aria-invalid={error}
                aria-readonly={readOnly ? true : undefined}
                // readOnly: keep the normal (non-disabled) look but block interaction — selection can't
                // change (onSelect early-returns) and clicks/focus are inert.
                className={cn(
                    'flex items-start',
                    !hasDirection && 'flex-col',
                    readOnly && 'pointer-events-none',
                    rest.className,
                )}
            >
                <RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>

                {showHelperSlot && (
                    <HelperRow
                        id={helperId}
                        role={helperAlertRole}
                        error={error}
                        message={message}
                        className={cn('m-0 items-center', error && 'font-medium')}
                    />
                )}
            </div>
        )
    },
)
