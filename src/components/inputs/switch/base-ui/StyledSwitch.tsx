import React, { forwardRef, useState, type ButtonHTMLAttributes } from 'react'
import styles from './StyledSwitch.module.scss'
import { cn } from 'src/helpers/cn'
import { getSvgIconStyle } from 'src/components/icons/iconStyle'
import type { IIcon } from 'src/components/icons'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#9197-92635
 * Figma "Switch" / `_BASE_Switch` (track 38×22, knob 18, touch 54×32). Figma **Selected** (true/false)
 * ← `checked`/`defaultChecked`; Figma **State** (Enabled/Hovered/Focused/Error/Disabled/Read-only)
 * ← native hover/focus + `error`/`disabled`/`readOnly`. On = `gama-500` #168181, Off = `delta-400` #a2acbb.
 */
type StyledSwitchProps = {
    /** @figmaProp Selected = true→"true" | false→"false" (controlled) */
    checked?: boolean
    /** @figmaProp Selected = initial (uncontrolled) */
    defaultChecked?: boolean
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp State = true→"Read-only" */
    readOnly?: boolean
    /** @figmaProp none — a11y */
    required?: boolean
    /** @figmaProp State = true→"Error" */
    error?: boolean
    /** @figmaProp none — a11y id */
    id?: string
    /** @figmaProp none — test hook */
    dataTest?: string
    className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'>

export type SwitchProps = StyledSwitchProps

const IndeterminateIcon = ({ className }: { className?: string }) => (
    <svg viewBox='0 0 24 24' className={className} fill='none'>
        <rect x='6' y='10.5' width='11' height='3' fill='currentColor' rx='0.75' />
    </svg>
)

const CheckIconSwitch: React.FC<IIcon> = ({ width = 11, height = 11, className = '', onClick, color }) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width={width}
        height={height}
        viewBox='0 0 448 512'
        className={className}
        onClick={onClick}
        style={getSvgIconStyle(color)}
        aria-hidden='true'
        focusable='false'
    >
        <path
            fill='currentColor'
            d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7L393.4 105.4c12.5-12.5 32.8-12.5 45.2 0'
        />
    </svg>
)

/**
 * Native `<button role="switch">` toggle (replaces `@base-ui/react`). Drives the SCSS module's
 * `data-checked`/`data-unchecked`/`data-disabled` selectors from React; the visual track/thumb stay
 * in SCSS (transitions/pseudo-elements — GUD-003). Public props + `onChange(event, checked)`
 * unchanged. TASK-201.
 */
export const StyledSwitch = forwardRef<HTMLButtonElement, StyledSwitchProps>(
    (
        {
            checked: controlledChecked,
            defaultChecked = false,
            onChange,
            disabled,
            readOnly,
            required,
            error,
            id,
            dataTest,
            className,
            onClick,
            ...rest
        },
        ref,
    ) => {
        const [uncontrolledChecked, setChecked] = useState(defaultChecked)
        const isControlled = controlledChecked !== undefined
        const checked = isControlled ? controlledChecked : uncontrolledChecked

        const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (readOnly || disabled) return
            const next = !checked
            if (!isControlled) setChecked(next)
            onChange?.({ target: { checked: next, name: id } } as React.ChangeEvent<HTMLInputElement>, next)
            onClick?.(event)
        }

        const iconClass = styles['iconContent']

        return (
            <button
                {...rest}
                ref={ref}
                type='button'
                role='switch'
                aria-checked={checked}
                aria-readonly={readOnly}
                aria-required={required}
                className={cn(styles['switch'], className)}
                onClick={handleToggle}
                disabled={disabled}
                id={id}
                name={id}
                data-testid={dataTest}
                data-checked={checked ? '' : undefined}
                data-unchecked={!checked ? '' : undefined}
                data-disabled={disabled ? '' : undefined}
                data-readonly={readOnly ? '' : undefined}
                data-error={error ? '' : undefined}
            >
                <span className={styles['thumb']}>
                    <span className={styles['icon']}>
                        {checked ? (
                            <CheckIconSwitch className={iconClass} />
                        ) : (
                            <IndeterminateIcon className={iconClass} />
                        )}
                    </span>
                </span>
            </button>
        )
    },
)
