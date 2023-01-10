import { Select } from 'antd'
import { clsx } from 'clsx'
import type { FC, PropsWithChildren } from 'react'

import styles from './SelectField.module.scss'

type TSelectFieldProps = {
    className?: string
    label?: string
    placeholder?: string
    value?: string
    error?: string
    onChange: (value: any) => void
    //
    lists: string[]
    translate?: boolean
}

const { Option } = Select

import './custom-antd-select.scss'

import { i18n } from '../../components/helpers/i18n'

/**
 * @deprecated Use the Common components
 */
export const SelectField: FC<PropsWithChildren<TSelectFieldProps>> = (props) => {
    return (
        <div className={clsx(props.className, styles['wrapper'])}>
            <label className={styles['label-wrapper']}>
                <span className={styles['label']}>{props.label}</span>
                <Select
                    className={clsx(styles['content'], 'select-field')}
                    value={props.value}
                    dropdownRender={(node) => {
                        return <div>{node}</div>
                    }}
                    onChange={(e) => {
                        props.onChange(e)
                    }}
                    status={props.error ? 'error' : undefined}
                    size='large'
                >
                    {props.lists.map((list) => {
                        return (
                            <Option key={list} value={list}>
                                {/*
                            //@todo: need transform current interface at the moment translate is not generic
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore  */}
                                {props.translate ? i18n[list] : list}
                            </Option>
                        )
                    })}
                    {props.children}
                </Select>
            </label>
            <span className={styles['error']}>{props.error}</span>
        </div>
    )
}
