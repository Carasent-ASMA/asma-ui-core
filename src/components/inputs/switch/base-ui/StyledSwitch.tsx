// components/StyledSwitch/StyledSwitch.tsx
import React, { forwardRef, useState } from 'react'
import { Switch } from '@base-ui-components/react/switch'
import styles from './StyledSwitch.module.scss'
import type { IIcon } from 'src/components/icons'
import { IconTemplate } from 'src/components/icons/IconTemplate'
import { cn } from 'src/helpers/cn'

type StyledSwitchProps = {
    checked?: boolean
    defaultChecked?: boolean
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    id?: string
    dataTest?: string
    value?: React.InputHTMLAttributes<HTMLInputElement>['value'] | unknown
} & Omit<React.ComponentProps<typeof Switch.Root>, 'children'>

export type SwitchProps = StyledSwitchProps

const IndeterminateIcon = ({ className }: { className?: string }) => (
    <svg viewBox='0 0 24 24' className={className} fill='none'>
        <rect x='6' y='10.5' width='11' height='3' fill='currentColor' rx='0.75' />
    </svg>
)

const CheckIconSwitch: React.FC<IIcon> = ({ width = 11, height = 11, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='fa-solid:check'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
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
            value,
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
                    target: { checked: newChecked, name: id, value: value },
                } as React.ChangeEvent<HTMLInputElement>,
                newChecked,
            )
        }

        const stateProps = isControlled ? { checked } : { defaultChecked }
        const iconClass = cn(styles['iconContent'], checked ? styles['checked'] : styles['unchecked'])

        return (
            <Switch.Root
                {...rest}
                {...stateProps}
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
