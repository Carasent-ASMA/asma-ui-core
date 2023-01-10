import { Icon } from '@iconify/react'
import { type ButtonProps, Button as AntButton } from 'antd'
import type { SizeType } from 'antd/es/config-provider/SizeContext'
import { clsx } from 'clsx'
import { omit } from 'lodash-es'
import type { FC } from 'react'

import styles from './Button.module.scss'

type IButtonCustom = ButtonProps & {
    icon?: string
    btnType?: 'primary' | 'secondary' | 'ghost'
    title?: string
    classNameIcon?: string
    disabled?: boolean
    size?: SizeType
}

/**
 * @deprecated use PrimaryButton, SecondaryButton, FlatButton
 */
const Button: FC<IButtonCustom> = (props) => {
    let _btnType: string | undefined = 'primary'
    let _btnTypeDisabled: string | undefined = undefined

    const btnType = props.btnType ?? 'primary'

    if (btnType === 'primary') {
        _btnType = styles[`btn-primary`]
        _btnTypeDisabled = styles[`btn-primary_disabled`]
    }

    if (btnType === 'secondary') {
        _btnType = styles[`btn-secondary`]
        _btnTypeDisabled = styles[`btn-secondary_disabled`]
    }

    if (btnType === 'ghost') {
        _btnType = undefined
        _btnTypeDisabled = undefined
    }

    return (
        <AntButton
            {...omit(props, 'btnType', 'classNameIcon', 'icon')}
            className={clsx(_btnType, props.className, styles['btn-wrapper'], props.disabled && _btnTypeDisabled)}
            {...(props.icon && {
                icon: (
                    <Icon
                        icon={props.icon || ''}
                        color={props.color || ''}
                        className={
                            (clsx(btnType === 'ghost' ? styles['icon-text'] : styles['icon']), props.classNameIcon)
                        }
                    />
                ),
            })}
        >
            {props.title}
        </AntButton>
    )
}

export { Button }
