import { DatePicker } from 'antd'
import type { PickerProps } from 'antd/lib/date-picker/generatePicker'
import type { InputStatus } from 'antd/lib/_util/statusUtils'
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

export type IPrimaryDateFieldProps = DatePickerProps & {
    label?: string
    error?: string
}

export const dateField = 'DD.MM.YYYY'

export const PrimaryDateField = forwardRef<RefType, IPrimaryDateFieldProps>(function PrimaryDateField(
    { error, label, ...props },
    ref,
) {
    const status = useErrorStatus(error)

    return (
        <div className={styles['wrapper']}>
            <label className={styles['label-wrapper']}>
                {label && <span className={styles['label']}>{label}</span>}

                <DatePicker ref={ref} className={styles['content']} {...props} status={status} />
            </label>
            {error && <span className={styles['error']}>{error}</span>}
        </div>
    )
})
