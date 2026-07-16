import React, { forwardRef, useCallback, useRef, type ChangeEvent, type InputHTMLAttributes } from 'react'
import styles from './StyledRadio.module.scss'
import { cn } from 'src/helpers/cn'
import { useRadioGroupContext, type RadioValue } from './RadioGroupContext'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15385-19720
 * Figma "Radio" / `_BASE_Radiobutton` (circle 20px, 40px touch). Figma **Selected** (on/off) ←
 * `checked` (or the surrounding `StyledRadioGroup`); Figma **State** (Enabled/Hovered/Focused/
 * Pressed/Error/Disabled/Read-only) ← native hover/focus + `error`/`disabled`/`readOnly`. Checked
 * ring + dot = `gama-500` #168181, unchecked border = `delta-500`, disabled = `delta-300`,
 * read-only = unchecked ring `delta-300` / checked ring+dot `delta-500` (node 35046-162573/162576).
 */
export type StyledRadioProps = {
    /** @figmaProp none — the group value this radio represents */
    value?: RadioValue
    /** @figmaProp none — test hook */
    dataTest?: string
    className?: string
    /** @figmaProp none — app size (Figma circle is 20px) */
    size?: 'small' | 'medium'
    /** @figmaProp State = true→"Error" */
    error?: boolean
    /** @figmaProp State = true→"Read-only" (unchecked ring delta-300 / checked ring+dot delta-500) */
    readOnly?: boolean
    /** @figmaProp Selected = true→"on" | false→"off" */
    checked?: boolean
    onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'className' | 'size' | 'checked' | 'onChange' | 'type'>
// @figmaProp disabled → State="Disabled" (from InputHTMLAttributes; the group can also set it)

/**
 * Native `<input type="radio">` (replaces `@base-ui/react`). Uses the surrounding
 * `StyledRadioGroup` context for name/selection when present, else the standalone `checked` prop.
 * SCSS module (ripple/pseudo-elements — GUD-003) is driven via `data-*` from React. TASK-201.
 */
export const StyledRadio = forwardRef<HTMLInputElement, StyledRadioProps>(
    ({ value, dataTest, className, size = 'medium', error, disabled, readOnly, checked, onChange, ...rest }, ref) => {
        const group = useRadioGroupContext()
        const isChecked = group ? group.value === value : !!checked
        const isDisabled = disabled ?? group?.disabled ?? false

        const wrapperClasses = cn(
            styles['RadioWrapper'],
            styles['RadioHover'],
            size === 'small' && styles['size-small'],
            className,
            error && styles['Error'],
            readOnly && styles['ReadOnly'],
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
            if (readOnly) return
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
