import { DatePicker, DatePickerProps } from 'antd'
import { PickerProps } from 'antd/lib/date-picker/generatePicker'
import { InputStatus } from 'antd/lib/_util/statusUtils'
import { Moment } from 'moment'
import { type Component, forwardRef } from 'react'

import styles from './PrimaryDateField.module.scss'

// type IPrimaryDateField = PickerComponentClass<
//     PickerProps<Moment> & {
//         status?: InputStatus
//         dropdownClassName?: string
//         popupClassName?: string
//     },
//     unknown
// > & {
//     label?: string
//     error?: string
// }

type IPrimaryDateField = DatePickerProps & {
    label?: string
    error?: string
}

function useErrorStatus(error?: string) {
    let result: InputStatus | undefined

    if (error) {
        result = 'error'
    }

    return result
}

export const dateField_DefaultFormat = 'DD.MM.YYYY'

export const PrimaryDateField = forwardRef<
    Component<
        PickerProps<Moment> & {
            status?: InputStatus
            dropdownClassName?: string
            popupClassName?: string
        },
        unknown
    >,
    IPrimaryDateField
>(function PrimaryDateField({ error, label, ...props }, ref) {
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
