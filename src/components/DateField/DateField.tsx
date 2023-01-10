import { Icon } from '@iconify/react'
import { ConfigProvider, DatePicker } from 'antd'
import type { DatePickerProps } from 'antd/es'
import type { Locale } from 'antd/lib/locale-provider'
import { DatePicker as DatePickerMobile } from 'antd-mobile'
import { clsx } from 'clsx'
import { format, isValid } from 'date-fns'
import { omit } from 'lodash-es'
import moment from 'moment'
import { type FC, useCallback, useState } from 'react'

import { mobileView, useWindowWidthSize } from '../helpers/hooks/useWindowWidthSize.hook'
import { i18n } from '../helpers/i18n'
import styles from './DateField.module.scss'
import { generateMonth } from './generate_month'

type IDateField = DatePickerProps & {
    label?: string
    value?: moment.Moment | null | Date
    onChange: (date: Date | null) => void
    format?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
    locale?: Locale
}

export const defaultFormat = 'DD.MM.YYYY'

const DateField: FC<IDateField> = (props, { format_data = defaultFormat }: { format_data: string }) => {
    const windowWidthSize = useWindowWidthSize()
    const isMobileView = mobileView(windowWidthSize)

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
                {isMobileView ? (
                    <DatePickerMobile
                        className={styles['mobile-version']}
                        defaultValue={props?.value?.toDate()}
                        mouseWheel={true}
                        visible={datePickerMobile}
                        onClose={() => setDatePickerMobile(false)}
                        confirmText={i18n.ok}
                        cancelText={i18n.close}
                        renderLabel={renderLabelMobileView}
                        value={props?.value?.toDate()}
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
                ) : (
                    <ConfigProvider locale={props.locale}>
                        <DatePicker
                            placeholder={i18n.select_date}
                            format={format_data}
                            className={styles['content']}
                            {...omit(props, 'error', 'is_error', 'is_warning')}
                            value={(!!props.value && moment(props.value)) || null}
                            onChange={(value) => {
                                if (!value || !value.isValid()) {
                                    props.onChange(null)
                                    return
                                }

                                props.onChange(value.toDate())
                            }}
                            status={isErrorOrNot()}
                        />
                    </ConfigProvider>
                )}
            </label>
            {isErrorOrNot() && (
                <span className={styles['error']}>{props.error ? props.error : i18n.required_field}</span>
            )}
        </div>
    )
}

export { DateField }
