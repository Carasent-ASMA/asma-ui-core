import { Icon } from '@iconify/react'
import { Picker } from 'antd-mobile'
import { PickerActions } from 'antd-mobile/es/components/picker'
import { clsx } from 'clsx'
import { format, setHours, setMinutes } from 'date-fns'
import { forwardRef, useState } from 'react'

import { i18n } from '../helpers/i18n'
import { getGeneratedTime } from './helper'
import styles from './PrimaryTimeFieldMobile.module.scss'

export interface IPrimaryTimeFieldMobileProps extends React.ComponentPropsWithRef<typeof Picker> {
    label?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
    disabled?: boolean
    onChange: (date: Date | null) => void
}

export const PrimaryTimeFieldMobile = forwardRef<PickerActions, IPrimaryTimeFieldMobileProps>((props, ref) => {
    const [timePickerMobile, setTimePickerMobile] = useState(false)

    const validTimeForMobilePicker = props.value ? new Date(props.value.toString()) : new Date()

    const hours = format(validTimeForMobilePicker, 'HH')
    const minutes = format(validTimeForMobilePicker, 'mm')

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
        <div className={styles['wrapper']}>
            <label className={styles['label-wrapper']}>
                {props.label && <span className={styles['label']}>{props.label}</span>}
                <Picker
                    ref={ref}
                    popupClassName={styles['mobile-version']}
                    confirmText={i18n.ok}
                    cancelText={i18n.close}
                    onClose={() => setTimePickerMobile(false)}
                    columns={[getGeneratedTime(24), getGeneratedTime(60)]}
                    visible={timePickerMobile}
                    mouseWheel={true}
                    value={[hours, minutes]}
                    defaultValue={[hours, minutes]}
                    forceRender={true}
                    style={{
                        '--header-button-font-size': '16px',
                        '--item-font-size': '16px',
                        '--item-height': '40px',
                        height: 'calc(48px * 7)',
                    }}
                    onSelect={(val) => {
                        const hours = val[0] ? +val[0] : 0
                        const minutes = val[1] ? +val[1] : 0

                        const time = new Date(setMinutes(setHours(validTimeForMobilePicker, hours), minutes))

                        if (!props.onChange || !val) return
                        props.onChange(time)
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
                                onClick={() => !props.disabled && setTimePickerMobile(!timePickerMobile)}
                            >
                                <span>
                                    {props.disabled || data === null
                                        ? i18n.select_time
                                        : format(validTimeForMobilePicker, 'HH:mm')}
                                </span>
                                <span className={'text-base opacity-40'}>
                                    <Icon icon={'ic:baseline-access-time'} />
                                </span>
                            </div>
                        )
                    }}
                </Picker>
            </label>
            {isErrorOrNot() && (
                <span className={styles['error']}>{props.error ? props.error : i18n.required_field}</span>
            )}
        </div>
    )
})
