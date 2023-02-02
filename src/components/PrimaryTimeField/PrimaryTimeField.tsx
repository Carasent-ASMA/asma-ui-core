import { TimePicker } from 'antd'
import clsx from 'clsx'
import { forwardRef } from 'react'
import { useErrorStatus } from '../helpers/hooks'

import styles from './PrimaryTimeField.module.scss'

const format_time = 'HH:mm'

export interface IPrimaryTimeFieldProps extends React.ComponentPropsWithRef<typeof TimePicker> {
    label?: string
    error?: string
}

export const PrimaryTimeField = forwardRef<any, IPrimaryTimeFieldProps>(function PrimaryTimeField(
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
