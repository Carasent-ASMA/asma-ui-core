import { type SelectProps } from 'antd'
import { clsx } from 'clsx'
import { useState } from 'react'
import styles from './PrimarySelectFieldMobile.module.scss'
import { SelectOptionsMobile } from './SelectOptionsMobile'

export type TPrimarySelectFieldMobileProps = SelectProps & {
    lists: string[]
    translate?: boolean
    label?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
    background?: string
}

export const PrimarySelectFieldMobile: React.FC<TPrimarySelectFieldMobileProps> = ({
    error,
    label,
    lists,
    translate = false,
    background = '',
    ...props
}) => {
    const [selectMobile, setSelectMobile] = useState(false)

    return (
        <div className={clsx(props.className, styles['wrapper'])}>
            <label className={styles['label-wrapper']}>
                {label && <span className={styles['label']}>{label}</span>}

                <>
                    <div
                        className={`flex h-10 items-center justify-between overflow-hidden rounded-md border border-custom-grey-04 px-4 text-base ${background}`}
                        onClick={() => setSelectMobile(!selectMobile)}
                    >
                        {/* @ts-ignore */}
                        <span>{translate ? i18n[props.value] : props.value}</span>
                        <span className='material-icons-outlined'>arrow_drop_down</span>
                    </div>

                    <SelectOptionsMobile
                        lists={lists}
                        placeholder={props.placeholder}
                        value={props.value}
                        onSelect={props.onSelect}
                        visible={selectMobile}
                        onClose={() => setSelectMobile(!selectMobile)}
                    />
                </>
            </label>
            {error && <span className={styles['error']}>{error}</span>}
        </div>
    )
}
