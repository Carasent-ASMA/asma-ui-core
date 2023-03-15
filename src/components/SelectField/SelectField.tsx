import { Icon } from '@iconify/react'
import { type SelectProps, Select } from 'antd'
import type { SelectValue } from 'antd/lib/select'
import { clsx } from 'clsx'
import { omit } from 'lodash-es'
import { useState } from 'react'

import { mobileView, useWindowWidthSize } from '../helpers/hooks/useWindowWidthSize.hook'
import { i18n } from '../helpers/i18n'
import styles from './SelectField.module.scss'
import { SelectOptionsMobile } from './SelectOptionsMobile'

type TSelectCustom = SelectValue & { lists: string[]; translate?: boolean; label?: string }
export type TSelectCustomProps = SelectProps & {
    lists: string[]
    translate?: boolean
    label?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
    background?: string
}

const { Option } = Select

/**
 * @deprecated use PrimarySelectField or PrimarySelectFieldMobile
 */
const SelectField = <T extends TSelectCustom = TSelectCustom>({
    lists,
    translate = false,
    background = '',
    ...props
}: TSelectCustomProps) => {
    const windowWidthSize = useWindowWidthSize()
    const isMobileView = mobileView(windowWidthSize)

    const [selectMobile, setSelectMobile] = useState(false)

    const [internalValue, setInternalValue] = useState(props.value)

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
                            className={`flex h-10 items-center justify-between overflow-hidden rounded-md border border-custom-grey-04 px-4 text-base ${background}`}
                            onClick={() => setSelectMobile(!selectMobile)}
                        >
                            {/* @ts-ignore */}
                            <span>{translate ? i18n[internalValue] : internalValue}</span>
                            <Icon icon='ic:outline-arrow-drop-down' inline />
                        </div>

                        <SelectOptionsMobile
                            translate={translate}
                            lists={lists}
                            placeholder={props.placeholder}
                            value={internalValue}
                            onSelect={(value) => {
                                setInternalValue(value)
                            }}
                            visible={selectMobile}
                            onClose={() => setSelectMobile(!selectMobile)}
                        />
                    </>
                ) : (
                    <Select<T>
                        {...omit(props, 'lists', 'translate', 'is_warning', 'is_error', 'error')}
                        className={clsx(styles['content'], styles['select-field'])}
                        status={isErrorOrNot()}
                        suffixIcon={<Icon icon='ic:outline-arrow-drop-down' />}
                        value={internalValue}
                    >
                        {lists.map((list, i) => (
                            <Option key={i} value={list} enum='enum+'>
                                {/* @ts-ignore */}
                                {translate ? i18n[list] : list}
                            </Option>
                        ))}
                    </Select>
                )}
            </label>
            {isErrorOrNot() && (
                <span className={styles['error']}>{props.error ? props.error : i18n.required_field}</span>
            )}
        </div>
    )
}

export { SelectField }
