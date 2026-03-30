import React, { useEffect, type SVGProps } from 'react'
import { Checkbox } from '@base-ui/react'
import styles from './StyledCheckbox.module.scss'
import { cn } from 'src/helpers/cn'

type StyledCheckboxProps = {
    dataTest: string
    size?: 'small' | 'medium'
    checked?: boolean
    indeterminate?: boolean
    disableRipple?: boolean
    hideWrapper?: boolean
    className?: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
} & Omit<React.ComponentProps<typeof Checkbox.Root>, 'children'>

export const IndeterminateIcon = (props: SVGProps<SVGSVGElement>): React.JSX.Element => (
    <svg viewBox='0 0 24 24' width='100%' height='100%' fill='none' {...props}>
        <title>Indeterminate icon</title>
        <path d='M6 12H18' stroke='currentColor' strokeWidth={props.strokeWidth ?? 3} strokeLinecap='round' />
    </svg>
)

export const CheckIcon = (props: SVGProps<SVGSVGElement>): React.JSX.Element => (
    <svg
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
        <title>Check icon</title>
        <path d='M4 12l5 5L20 6' />
    </svg>
)

export const StyledCheckbox: React.FC<StyledCheckboxProps> = ({
    dataTest,
    size = 'medium',
    disabled,
    readOnly,
    indeterminate = false,
    checked,
    disableRipple,
    hideWrapper,
    className,
    onChange,
    ...props
}): JSX.Element => {
    const isHideWrapper = !!hideWrapper
    const isRippleEnabled = !disableRipple && !isHideWrapper && !disabled && !readOnly

    const wrapperClasses = cn(
        styles['CheckboxWrapper'],
        !isHideWrapper && styles[`size-${size}`],
        isHideWrapper && styles['HideWrapper'],
        indeterminate && styles['Indeterminate'],
        readOnly && styles['ReadOnly'],
        isRippleEnabled && styles['CheckboxHover'],
        className,
    )

    const checkboxClasses = cn(
        'styled-checkbox-inner',
        styles['Checkbox'],
        styles[`size-${size}`],
        indeterminate && styles['Indeterminate'],
    )
    const CheckboxIcon = indeterminate ? IndeterminateIcon : CheckIcon

    const rippleRef = React.useRef<HTMLSpanElement>(null)

    const handlePointerDown = React.useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation()
            if (!isRippleEnabled) return

            const ripple = document.createElement('span')
            if (styles['CheckboxRipple']) {
                ripple.className = styles['CheckboxRipple']
            }
            ripple.addEventListener(
                'animationend',
                () => {
                    ripple.remove()
                },
                { once: true },
            )
            rippleRef.current?.appendChild(ripple)
        },
        [isRippleEnabled],
    )

    useEffect(() => {
        const rippleNode = rippleRef.current
        return () => {
            rippleNode?.replaceChildren()
        }
    }, [])

    const handleCheckedChange = React.useCallback(
        (val: boolean) => {
            if (readOnly) return
            const fakeEvent = {
                target: { name: props.name, value: props.value, checked: val },
            } as React.ChangeEvent<HTMLInputElement>
            onChange?.(fakeEvent, val)
        },
        [onChange, props.name, props.value, readOnly],
    )

    return (
        <Checkbox.Root
            className={wrapperClasses}
            data-testid={dataTest}
            checked={checked}
            disabled={disabled}
            readOnly={readOnly}
            indeterminate={indeterminate}
            onPointerDown={handlePointerDown}
            onCheckedChange={handleCheckedChange}
            {...props}
        >
            {!isHideWrapper && isRippleEnabled && (
                <span ref={rippleRef} className={styles['CheckboxRippleContainer']} />
            )}
            <span className={checkboxClasses}>
                <Checkbox.Indicator className={styles['Indicator']}>
                    <CheckboxIcon strokeWidth={size === 'small' ? 3 : 2} />
                </Checkbox.Indicator>
            </span>
        </Checkbox.Root>
    )
}
