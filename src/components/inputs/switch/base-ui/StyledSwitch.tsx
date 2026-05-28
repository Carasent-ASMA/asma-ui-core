// components/StyledSwitch/StyledSwitch.tsx
import React, { forwardRef, useState } from 'react'
import { Switch } from '@base-ui/react/switch'
import styles from './StyledSwitch.module.scss'
import { getSvgIconStyle } from 'src/components/icons/iconStyle'
import type { IIcon } from 'src/components/icons'

type StyledSwitchProps = {
    checked?: boolean
    defaultChecked?: boolean
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    id?: string
    dataTest?: string
    // value?: React.InputHTMLAttributes<HTMLInputElement>['value']
} & Omit<React.ComponentProps<typeof Switch.Root>, 'children'>

export type SwitchProps = StyledSwitchProps

const IndeterminateIcon = ({ className }: { className?: string }) => (
    <svg viewBox='0 0 24 24' className={className} fill='none'>
        <rect x='6' y='10.5' width='11' height='3' fill='currentColor' rx='0.75' />
    </svg>
)

const CheckIconSwitch: React.FC<IIcon> = ({ width = 11, height = 11, className = '', onClick, color }) => {
    const style = getSvgIconStyle(color)

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={width}
            height={height}
            viewBox='0 0 448 512'
            className={className}
            onClick={onClick}
            style={style}
            aria-hidden='true'
            focusable='false'
        >
            <path
                fill='currentColor'
                d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7L393.4 105.4c12.5-12.5 32.8-12.5 45.2 0'
            />
        </svg>
    )
}

export const StyledSwitch = forwardRef<HTMLButtonElement, StyledSwitchProps>(
    (
        {
            checked: controlledChecked,
            defaultChecked = false,
            onChange,
            disabled,
            readOnly,
            required,
            // value,
            id,
            dataTest,
            ...rest
        },
        ref,
    ) => {
        const [uncontrolledChecked, setChecked] = useState(defaultChecked)
        const isControlled = controlledChecked !== undefined
        const checked = isControlled ? controlledChecked : uncontrolledChecked

        const handleChange = (newChecked: boolean) => {
            if (!isControlled) setChecked(newChecked)
            onChange?.(
                {
                    target: { checked: newChecked, name: id },
                } as React.ChangeEvent<HTMLInputElement>,
                newChecked,
            )
        }

        const stateProps = isControlled ? { checked } : { defaultChecked }
        const iconClass = styles['iconContent']

        return (
            <Switch.Root
                {...rest}
                {...stateProps}
                nativeButton
                render={<button />}
                ref={ref}
                className={styles['switch']}
                onCheckedChange={handleChange}
                disabled={disabled}
                readOnly={readOnly}
                required={required}
                id={id}
                name={id}
                data-testid={dataTest}
            >
                <Switch.Thumb className={styles['thumb']}>
                    <span className={styles['icon']}>
                        {checked ? (
                            <CheckIconSwitch className={iconClass} />
                        ) : (
                            <IndeterminateIcon className={iconClass} />
                        )}
                    </span>
                </Switch.Thumb>
            </Switch.Root>
        )
    },
)
