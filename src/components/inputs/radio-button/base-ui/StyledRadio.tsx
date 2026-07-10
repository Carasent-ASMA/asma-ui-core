import React, { forwardRef, useCallback, useRef, type ChangeEvent, type InputHTMLAttributes } from 'react'
import styles from './StyledRadio.module.scss'
import { cn } from 'src/helpers/cn'
import { useRadioGroupContext, type RadioValue } from './RadioGroupContext'

export type StyledRadioProps = {
    value?: RadioValue
    dataTest?: string
    className?: string
    size?: 'small' | 'medium'
    error?: boolean
    checked?: boolean
    onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'className' | 'size' | 'checked' | 'onChange' | 'type'>

/**
 * Native `<input type="radio">` (replaces `@base-ui/react`). Uses the surrounding
 * `StyledRadioGroup` context for name/selection when present, else the standalone `checked` prop.
 * SCSS module (ripple/pseudo-elements — GUD-003) is driven via `data-*` from React. TASK-201.
 */
export const StyledRadio = forwardRef<HTMLInputElement, StyledRadioProps>(
    ({ value, dataTest, className, size = 'medium', error, disabled, checked, onChange, ...rest }, ref) => {
        const group = useRadioGroupContext()
        const isChecked = group ? group.value === value : !!checked
        const isDisabled = disabled ?? group?.disabled ?? false

        const wrapperClasses = cn(
            styles['RadioWrapper'],
            styles['RadioHover'],
            size === 'small' && styles['size-small'],
            className,
            error && styles['Error'],
        )
        const radioClasses = cn(styles['Radio'], size === 'small' && styles['size-small'])

        const rippleRef = useRef<HTMLSpanElement>(null)
        const handlePointerDown = useCallback((e: React.PointerEvent) => {
            e.stopPropagation()
            if (!rippleRef.current) return
            const ripple = document.createElement('span')
            if (styles['RadioRipple']) ripple.className = styles['RadioRipple']
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
            rippleRef.current.appendChild(ripple)
        }, [])

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            if (group) group.onSelect(value ?? null)
            onChange?.(event, event.target.checked)
        }

        return (
            <label
                className={wrapperClasses}
                data-testid={dataTest}
                onPointerDown={handlePointerDown}
                data-checked={isChecked ? '' : undefined}
                data-unchecked={!isChecked ? '' : undefined}
                data-disabled={isDisabled ? '' : undefined}
            >
                <input
                    {...rest}
                    ref={ref}
                    type='radio'
                    className='sr-only'
                    name={group?.name ?? rest.name}
                    value={value === undefined || value === null ? undefined : String(value)}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={handleChange}
                />
                <span className={styles['RadioRippleContainer']} ref={rippleRef} />
                <span className={radioClasses}>
                    <span className={styles['Indicator']} />
                </span>
            </label>
        )
    },
)
