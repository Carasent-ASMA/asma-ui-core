import { type TimePickerProps, TimePicker } from 'antd'
import { InputStatus } from 'antd/lib/_util/statusUtils'
import clsx from 'clsx'
import { forwardRef } from 'react'

import styles from './PrimaryTimeField.module.scss'

const format_time = 'HH:mm'

type ITimeFieldCustom = TimePickerProps & {
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

export const PrimaryTimeField = forwardRef<any, ITimeFieldCustom>(function PrimaryTimeField(
    { error, label, ...props },
    ref,
) {
    const status = useErrorStatus(error)

    return (
        <div className={styles['wrapper']}>
            <label className={styles['label-wrapper']}>
                {label && <span className={styles['label']}>{label}</span>}

                <TimePicker
                    ref={ref}
                    renderExtraFooter={() => null}
                    showNow={false}
                    minuteStep={10}
                    format={format_time}
                    {...props}
                    className={clsx(styles['content'], props.className)}
                    popupClassName={clsx(styles['piker_time'], props.popupClassName)}
                    status={status}
                />
            </label>
            {error && <span className={styles['error']}>{error}</span>}
        </div>
    )
})
