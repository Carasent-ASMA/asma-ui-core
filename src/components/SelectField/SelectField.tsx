import { Icon } from '@iconify/react'
import { Select } from 'antd'
import type { SelectProps } from 'antd/es/select'
import clsx from 'clsx'
import { omit } from 'lodash-es'
import React, { forwardRef, useState } from 'react'
import type { BaseSelectRef } from 'rc-select'

import styles from './SelectField.module.scss'
import { SelectOptionsMobile } from './SelectOptionsMobile'
import { mobileView, useWindowWidthSize } from '../helpers/hooks/useWindowWidthSize.hook'
import { i18n } from '../helpers/i18n'

export type TSelectCustomProps = SelectProps & {
    lists: string[]
    translate?: boolean
    label?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
}

const { Option } = Select

const SelectField = forwardRef<BaseSelectRef, TSelectCustomProps>((props, ref) => {
    const { translate, lists } = props
    const windowWidthSize = useWindowWidthSize()
    const isMobileView = mobileView(windowWidthSize)

    const [selectMobile, setSelectMobile] = useState(false)

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
        <div className={clsx(props.className, styles['wrapper'])}>
            <label className={styles['label-wrapper']}>
                {props.label && <span className={styles['label']}>{props.label}</span>}

                {isMobileView ? (
                    <>
                        <div
                            className={
                                'flex h-10 items-center justify-between overflow-hidden rounded-md border border-custom-grey-04 px-4 text-base'
                            }
                            onClick={() => setSelectMobile(!selectMobile)}
                        >
                            <span>{translate ? i18n[props.value as keyof typeof i18n] : props.value}</span>
                            <span className={'text-2xl opacity-40'}>
                                <Icon icon={'ic:baseline-keyboard-arrow-down'} />
                            </span>
                        </div>

                        <SelectOptionsMobile
                            translate={translate}
                            lists={lists}
                            placeholder={props.placeholder}
                            value={props.value}
                            onSelect={props.onSelect}
                            visible={selectMobile}
                            onClose={() => setSelectMobile(!selectMobile)}
                        />
                    </>
                ) : (
                    <Select
                        {...omit(props, 'lists', 'translate', 'is_warning', 'is_error', 'error')}
                        className={clsx(styles['content'], 'select-field')}
                        status={isErrorOrNot()}
                        ref={ref}
                    >
                        {lists.map((list, i) => {
                            return (
                                <Option key={i} value={list}>
                                    {translate ? i18n[list as keyof typeof i18n] : list}
                                </Option>
                            )
                        })}
                    </Select>
                )}
            </label>
            {isErrorOrNot() && (
                <span className={styles['error']}>{props.error ? props.error : i18n.required_field}</span>
            )}
        </div>
    )
})

export default SelectField
