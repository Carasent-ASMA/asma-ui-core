import React, { useEffect, useRef, type ChangeEvent, type SVGProps } from 'react'
import styles from './StyledCheckbox.module.scss'
import { cn } from 'src/helpers/cn'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15385-19713
 * Figma "Checkbox" (box 20px, 40px touch). Figma **Type** (Unchecked/Indeterminate/Checked) ←
 * `checked`/`indeterminate`; Figma **State** (Enabled/Hovered/Focused/Disabled/Read-only) ← native
 * hover/focus + `disabled`/`readOnly`/`error`. Checked/indeterminate box = `gama-500` #168181,
 * unchecked border = `delta-500`; Error = box border `error-500` #e10700 (node 41325-207511/207527).
 */
type StyledCheckboxProps = {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp none — app size (Figma box is 20px) */
    size?: 'small' | 'medium'
    /** @figmaProp Type = true→"Checked" | false→"Unchecked" */
    checked?: boolean
    /** @figmaProp Type = true→"Indeterminate" */
    indeterminate?: boolean
    /** @figmaProp State = true→"Error" (box border → error-500) */
    error?: boolean
    disableRipple?: boolean
    hideWrapper?: boolean
    className?: string
    checkboxClassName?: string
    onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'checked' | 'type'>
// @figmaProp disabled → State="Disabled" · readOnly → State="Read-only" (from InputHTMLAttributes)

export const IndeterminateIcon = (props: SVGProps<SVGSVGElement>): JSX.Element => (
    <svg aria-hidden='true' viewBox='0 0 24 24' width='100%' height='100%' fill='none' {...props}>
        <path d='M6 12H18' stroke='currentColor' strokeWidth={props.strokeWidth ?? 3} strokeLinecap='round' />
    </svg>
)

export const CheckIcon = (props: SVGProps<SVGSVGElement>): JSX.Element => (
    <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        width='100%'
        height='100%'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        {...props}
    >
        <path d='M4 12l5 5L20 6' />
    </svg>
)

/**
 * Native `<input type="checkbox">` checkbox (replaces `@base-ui/react`). A visually-hidden input
 * carries state + a11y; the visual box, ripple, and indeterminate bar come from the SCSS module
 * (kept: `@keyframes`/pseudo-elements aren't Tailwind-expressible — GUD-003), whose `data-*`
 * selectors are driven from React here. Public props unchanged. TASK-201.
 */
export const StyledCheckbox: React.FC<StyledCheckboxProps> = ({
    dataTest,
    size = 'medium',
    disabled,
    readOnly,
    error,
    indeterminate = false,
    checked,
    disableRipple,
    hideWrapper,
    className,
    checkboxClassName,
    onChange,
    onClick,
    ...props
}): JSX.Element => {
    const isHideWrapper = !!hideWrapper
    const isRippleEnabled = !disableRipple && !isHideWrapper && !disabled && !readOnly
    const inputRef = useRef<HTMLInputElement>(null)
    const rippleRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        if (inputRef.current) inputRef.current.indeterminate = indeterminate
    }, [indeterminate])

    const wrapperClasses = cn(
        styles['CheckboxWrapper'],
        !isHideWrapper && styles[`size-${size}`],
        isHideWrapper && styles['HideWrapper'],
        indeterminate && styles['Indeterminate'],
        readOnly && styles['ReadOnly'],
        error && styles['Error'],
        isRippleEnabled && styles['CheckboxHover'],
        className,
    )
    const checkboxClasses = cn(
        styles['Checkbox'],
        styles[`size-${size}`],
        indeterminate && styles['Indeterminate'],
        checkboxClassName,
    )
    const CheckboxIcon = indeterminate ? IndeterminateIcon : CheckIcon

    const handlePointerDown = React.useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation()
            if (!isRippleEnabled) return
            const ripple = document.createElement('span')
            if (styles['CheckboxRipple']) ripple.className = styles['CheckboxRipple']
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
            rippleRef.current?.appendChild(ripple)
        },
        [isRippleEnabled],
    )

    useEffect(() => {
        const rippleNode = rippleRef.current
        return () => rippleNode?.replaceChildren()
    }, [])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return
        onChange?.(event, event.target.checked)
    }

    // Drive the SCSS module's state selectors (base-ui used to set these data-* attributes).
    const stateAttrs = {
        'data-checked': checked && !indeterminate ? '' : undefined,
        'data-unchecked': !checked && !indeterminate ? '' : undefined,
        'data-indeterminate': indeterminate ? '' : undefined,
        'data-disabled': disabled ? '' : undefined,
    }

    return (
        <label
            className={wrapperClasses}
            data-testid={dataTest}
            onPointerDown={handlePointerDown}
            onClick={onClick as React.MouseEventHandler<HTMLLabelElement> | undefined}
            {...stateAttrs}
        >
            <input
                ref={inputRef}
                type='checkbox'
                className='sr-only'
                checked={checked}
                disabled={disabled}
                readOnly={readOnly}
                onChange={handleChange}
                {...props}
            />
            {!isHideWrapper && isRippleEnabled && <span ref={rippleRef} className={styles['CheckboxRippleContainer']} />}
            <span className={checkboxClasses}>
                <span className={styles['Indicator']}>
                    <CheckboxIcon strokeWidth={size === 'small' ? 3 : 2} />
                </span>
            </span>
        </label>
    )
}
