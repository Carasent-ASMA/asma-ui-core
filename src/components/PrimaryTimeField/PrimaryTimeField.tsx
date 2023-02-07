import { TimePicker } from 'antd'
import clsx from 'clsx'
import { forwardRef } from 'react'
import { useErrorStatus } from '../helpers/hooks'

import styles from './PrimaryTimeField.module.scss'

const format_time = 'HH:mm'

export type IPrimaryTimeFieldProps = Omit<
    React.ComponentPropsWithRef<typeof TimePicker>,
    'status' | 'renderExtraFooter' | 'showNow' | 'format'
> & {
    label?: string
    error?: string
}

export const PrimaryTimeField = forwardRef<any, IPrimaryTimeFieldProps>(function PrimaryTimeField(
    { error, label, className, popupClassName, ...props },
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
                    className={clsx(styles['content'], className)}
                    popupClassName={clsx(styles['piker_time'], popupClassName)}
                    status={status}
                    {...props}
                />
            </label>
            {error && <span className={styles['error']}>{error}</span>}
        </div>
    )
})
