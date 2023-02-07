import { DatePicker } from 'antd'
import type { PickerProps } from 'antd/lib/date-picker/generatePicker'
import type { InputStatus } from 'antd/lib/_util/statusUtils'
import clsx from 'clsx'
import type { Moment } from 'moment'
import { type Component, forwardRef } from 'react'
import { useErrorStatus } from '../helpers/hooks'

import styles from './PrimaryDateField.module.scss'

type DatePickerProps = React.ComponentPropsWithRef<typeof DatePicker>

type RefType = Component<
    PickerProps<Moment> & {
        status?: InputStatus
        dropdownClassName?: string
        popupClassName?: string
    },
    unknown
>

export type IPrimaryDateFieldProps = Omit<DatePickerProps, 'status'> & {
    label?: string
    error?: string
}

export const dateField = 'DD.MM.YYYY'

export const PrimaryDateField = forwardRef<RefType, IPrimaryDateFieldProps>(function PrimaryDateField(
    { error, label, className, ...props },
    ref,
) {
    const status = useErrorStatus(error)

    return (
        <div className={styles['wrapper']}>
            <label className={styles['label-wrapper']}>
                {label && <span className={styles['label']}>{label}</span>}
                <DatePicker ref={ref} className={clsx(className, styles['content'])} status={status} {...props} />
            </label>
            {error && <span className={styles['error']}>{error}</span>}
        </div>
    )
})
