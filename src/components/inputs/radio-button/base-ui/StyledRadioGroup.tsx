import React, { forwardRef, useId, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
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
    /** Why the selection can't be changed here, and where it can (disabled-states DIS-6). Shown on
     * hover, focus and tap of the read-only group. */
    readOnlyReason?: ReactNode
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
            readOnlyReason,
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
            [groupName, selected, disabled, readOnly],
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

        const active = Boolean(readOnly && readOnlyReason)

        const group = (
            <div
                {...rest}
                ref={ref}
                role='radiogroup'
                data-testid={dataTest}
                aria-describedby={showHelperSlot ? helperId : undefined}
                aria-invalid={error}
                aria-readonly={readOnly ? true : undefined}
                // readOnly: keep the normal (non-disabled) look; selection can't change (onSelect
                // early-returns). Pointer events stay on so the reason can be hovered (DIS-6).
                className={cn(
                    'flex items-start',
                    !hasDirection && 'flex-col',
                    readOnly && 'cursor-default [&_*]:cursor-default',
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

        return (
            <StyledTooltip
                keepMounted
                title={readOnlyReason}
                open={active ? undefined : false}
                openOnTap={active}
                persistentDescription={active}
            >
                {group}
            </StyledTooltip>
        )
    },
)
