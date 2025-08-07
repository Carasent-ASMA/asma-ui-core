import * as React from 'react'
import { Checkbox } from '@base-ui-components/react/checkbox'
import styles from './StyledCheckbox.module.scss'
import { CheckIcon } from 'src/components/icons'
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

export const IndeterminateIcon = ({ className }: { className?: string }) => (
    <svg viewBox='0 0 24 24' className={className} fill='none'>
        <rect x='5.5' y='10.5' width='13' height='2.75' fill='currentColor' />
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
}) => {
    const wrapperClasses = cn(
        !hideWrapper && styles['CheckboxWrapper'],
        !hideWrapper && styles[`size-${size}`],
        !hideWrapper && disabled && styles['Disabled'],
        !hideWrapper && !disableRipple && styles['CheckboxHover'],
        className,
    )

    const checkboxClasses = cn(
        styles['Checkbox'],
        styles[`size-${size}`],
        disabled && styles['Disabled'],
        readOnly && styles['ReadOnly'],
    )

    const CheckboxIcon = indeterminate ? IndeterminateIcon : CheckIcon

    const rippleRef = React.useRef<HTMLSpanElement>(null)

    const handleRipple = () => {
        if (disableRipple || disabled || readOnly) return

        const ripple = document.createElement('span')
        ripple.className = styles['CheckboxRipple'] || ''
        rippleRef.current?.appendChild(ripple)

        setTimeout(() => ripple.remove(), 400)
    }

    return (
        <label className={wrapperClasses} data-test={dataTest} onClick={handleRipple}>
            {!disableRipple && !hideWrapper && <span ref={rippleRef} className={styles['CheckboxRippleContainer']} />}
            <Checkbox.Root
                checked={checked}
                disabled={disabled}
                readOnly={readOnly}
                data-test={dataTest}
                className={checkboxClasses}
                indeterminate={indeterminate}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onCheckedChange={(val: boolean) => {
                    if (readOnly) return
                    const fakeEvent = {
                        target: { name: props.name, value: props.value, checked: val },
                    } as React.ChangeEvent<HTMLInputElement>
                    onChange?.(fakeEvent, val)
                }}
                {...props}
            >
                <Checkbox.Indicator className={styles['Indicator']} style={{ pointerEvents: 'none' }}>
                    <CheckboxIcon />
                </Checkbox.Indicator>
            </Checkbox.Root>
        </label>
    )
}
