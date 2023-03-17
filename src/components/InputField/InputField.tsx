import { Icon } from '@iconify/react'
import { type InputProps, Input, type InputRef } from 'antd'
import { clsx } from 'clsx'
import { omit } from 'lodash-es'
import React, { forwardRef } from 'react'

import { i18n } from '../helpers/i18n'
import styles from './InputField.module.scss'

export enum IconPositionEnum {
    Prefix = 'prefix',
    Suffix = 'suffix',
    Both = 'both',
}

type CustomInputProps = InputProps & {
    icon_style?: string
    icon?: string
    label?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
    iconPosition?: IconPositionEnum
}

export const InputField = forwardRef<InputRef, CustomInputProps>((props, ref) => {
    const isErrorOrNot = () => {
        if (props.is_error) {
            return 'error'
        }

        if (props.is_warning) {
            return 'warning'
        }

        return undefined
    }

    return (
        <div className={styles['input-wrapper']}>
            <label>
                {props.label && <span className={styles['text-label']}>{props.label}</span>}
                <Input
                    placeholder={i18n.write_something}
                    {...((props.iconPosition === IconPositionEnum.Prefix ||
                        props.iconPosition === IconPositionEnum.Both) && {
                        prefix: <Icon icon={props.icon ?? ''} className={clsx('text-xl', props.icon_style)} />,
                    })}
                    {...((props.iconPosition === IconPositionEnum.Suffix ||
                        props.iconPosition === IconPositionEnum.Both) && {
                        suffix: <Icon icon={props.icon ?? ''} className={clsx('text-xl', props.icon_style)} />,
                    })}
                    {...omit(props, 'is_warning', 'iconPosition', 'is_error', 'error')}
                    status={isErrorOrNot()}
                    ref={ref}
                />
            </label>
            {isErrorOrNot() && (
                <span className={styles['error-message']}>{props.error ? props.error : i18n.required_field}</span>
            )}
        </div>
    )
})
