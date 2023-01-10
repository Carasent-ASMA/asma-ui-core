import 'moment/locale/nb'

import { DatePicker } from 'antd'
import locale from 'antd/es/date-picker/locale/nb_NO'
import { clsx } from 'clsx'
import moment from 'moment'

import styles from './DateField.module.scss'
export const DateField: React.FC<{
    className?: string
    label?: string
    placeholder?: string
    value: Date | null
    error?: string
    onChange: (date: Date | null) => void
    disabled?: boolean
}> = function DateField(props) {
    return (
        <div className={clsx(props.className, styles['wrapper'])}>
            <label className={styles['label-wrapper']}>
                <span className={styles['label']}>{props.label}</span>
                <DatePicker
                    disabled={props.disabled}
                    locale={locale}
                    picker='date'
                    format='DD.MM.YYYY'
                    className={styles['content']}
                    value={(props.value && moment(props.value, 'DD.MM.YYYY')) || undefined}
                    onChange={(value) => {
                        if (!value) {
                            props.onChange(null)

                            return
                        }

                        if (!value.isValid) {
                            props.onChange(null)

                            return
                        }

                        props.onChange(value.toDate())
                    }}
                    placeholder={props.placeholder}
                    allowClear={false}
                    suffixIcon={<span className={clsx('material-icons', styles['icon'])}>date_range</span>}
                />
            </label>
            <span className={styles['error']}>{props.error}</span>
        </div>
    )
}
