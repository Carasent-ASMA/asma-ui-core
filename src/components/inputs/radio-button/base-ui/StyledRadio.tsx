import React, { forwardRef, useRef, useCallback } from 'react'
import { Radio } from '@base-ui-components/react/radio'
import styles from './StyledRadio.module.scss'
import { cn } from 'src/helpers/cn'

type StyledRadioProps = {
    value?: string | number | boolean
    dataTest?: string
    className?: string
    size?: 'small' | 'medium'
    error?: boolean
} & Omit<React.ComponentProps<typeof Radio.Root>, 'value' | 'className'>

export const StyledRadio = forwardRef<HTMLButtonElement, StyledRadioProps>(
    ({ value, dataTest, className, size = 'medium', error, disabled, ...rest }, ref) => {
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
            ripple.className = styles['RadioRipple'] || ''
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
            rippleRef.current.appendChild(ripple)
        }, [])

        return (
            <Radio.Root
                {...rest}
                ref={ref}
                value={value}
                data-test={dataTest}
                className={wrapperClasses}
                disabled={disabled}
                onPointerDown={handlePointerDown}
            >
                <span className={styles['RadioRippleContainer']} ref={rippleRef} />
                <span className={radioClasses}>
                    <Radio.Indicator className={styles['Indicator']} />
                </span>
            </Radio.Root>
        )
    },
)
