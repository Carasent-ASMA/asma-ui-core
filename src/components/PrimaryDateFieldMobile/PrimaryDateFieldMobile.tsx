import { Icon } from '@iconify/react'
import { DatePicker as DatePickerMobile } from 'antd-mobile'
import { clsx } from 'clsx'
import { format, isValid } from 'date-fns'
import React, { useCallback, useState, forwardRef } from 'react'

import { i18n } from '../helpers/i18n'
import styles from './PrimaryDateFieldMobile.module.scss'
import { generateMonth } from './generate_month'
import type { PickerActions } from 'antd-mobile/es/components/picker'

export interface IPrimaryDateFieldMobileProps extends React.ComponentPropsWithRef<typeof DatePickerMobile> {
    label?: string
    onChange: (date: Date | null) => void
    // format?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
    // locale?: Locale
    disabled?: boolean
}

export const PrimaryDateFieldMobile = forwardRef<PickerActions, IPrimaryDateFieldMobileProps>(
    function PrimaryDateFieldMobile(props, ref) {
        const [datePickerMobile, setDatePickerMobile] = useState(false)

        const isErrorOrNot = () => {
            if (props.is_error) {
                return 'error'
            }

            if (props.is_warning) {
                return 'warning'
            }

            return undefined
        }

        const renderLabelMobileView = useCallback(
            (type: string, data: number) => {
                // const validDateForMobilePicker = props.value ? props.value.toDate() : new Date()

                if (type === 'month') {
                    return generateMonth(data)
                    // return format(new Date(validDateForMobilePicker.getFullYear(), data - 1), 'LLL')
                }

                return data
            },
            [props.value],
        )

        return (
            <div className={styles['wrapper']}>
                <label className={styles['label-wrapper']}>
                    {props.label && <span className={styles['label']}>{props.label}</span>}
                    <DatePickerMobile
                        ref={ref}
                        className={styles['mobile-version']}
                        defaultValue={props?.value}
                        mouseWheel={true}
                        visible={datePickerMobile}
                        onClose={() => setDatePickerMobile(false)}
                        confirmText={i18n.ok}
                        cancelText={i18n.close}
                        renderLabel={renderLabelMobileView}
                        value={props?.value}
                        forceRender={true}
                        style={{
                            '--header-button-font-size': '16px',
                            '--item-font-size': '16px',
                            '--item-height': '40px',
                            height: 'calc(48px * 7)',
                        }}
                        onConfirm={(value) => {
                            if (!value || !isValid(value) || props.disabled) {
                                props.onChange(null)
                                return
                            }
                            props.onChange(value)
                        }}
                    >
                        {(data) => {
                            return (
                                <div
                                    className={clsx(
                                        styles['content'],
                                        props.disabled && styles['content_disabled'],
                                        'justify-between',
                                    )}
                                    onClick={() => !props.disabled && setDatePickerMobile(!datePickerMobile)}
                                >
                                    <span>
                                        {props.disabled || !isValid(data) || data === null
                                            ? i18n.select_date
                                            : format(data, 'dd.LL.yyyy')}
                                    </span>
                                    <span className={'text-base opacity-40'}>
                                        <Icon icon={'ic:outline-calendar-today'} />
                                    </span>
                                </div>
                            )
                        }}
                    </DatePickerMobile>
                </label>
                {isErrorOrNot() && (
                    <span className={styles['error']}>{props.error ? props.error : i18n.required_field}</span>
                )}
            </div>
        )
    },
)
