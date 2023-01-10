import { Icon } from '@iconify/react'
import { Dropdown, Input, Menu } from 'antd'
import type { ItemType } from 'antd/lib/menu/hooks/useItems'
import { clsx } from 'clsx'
import * as React from 'react'

import { i18n } from '../helpers/i18n'
import styles from './SearchField.module.scss'

export type TOption = { label: string; value: string }

const Options: React.FC<{
    options: TOption[] | undefined
    selected: TOption | null | undefined
    onChange: (value: string | null) => void
    notFound?: React.ReactNode
}> = (props) => {
    if (!props.options || !props.options.length) {
        if (!props.notFound) {
            return <div className={styles['not-found']}>{i18n.not_found}</div>
        }

        return <>{props.notFound}</>
    }

    return (
        <Menu
            items={props.options.map((option) => {
                const result: ItemType = {
                    key: option.value,
                    label: <span>{option.label}</span>,
                    onClick: (e) => {
                        console.log('>>e', e)

                        props.onChange(e.key)
                    },
                }

                return result
            })}
        />
    )
}

const keys = ['Enter', 'Escape']

const SearchField: React.FC<{
    className?: string
    prefix?: React.ReactNode
    label: string
    searchText: string
    onChangeSearchText: (value: string) => void
    options: TOption[] | undefined
    selected: TOption | null | undefined
    onChange: (value: string | null) => void
    notFound?: React.ReactNode
    error?: string | null
}> = function SearchField(props) {
    return (
        <div className={clsx(props.className, styles['wrapper'])}>
            <label className={styles['label-wrapper']}>
                <span className={styles['label']}>{props.label}</span>
                <div></div>
                <div className={styles['input-wrapper']}>
                    <div className={styles['prefix-wrapper']}>{props.prefix}</div>
                    <Dropdown
                        overlay={
                            <Options
                                options={props.options}
                                selected={props.selected}
                                onChange={props.onChange}
                                notFound={props.notFound}
                            />
                        }
                        trigger={['click']}
                        disabled={!!props.selected}
                    >
                        <Input
                            className={styles['input']}
                            onChange={(e) => {
                                props.onChangeSearchText(e.target.value)
                            }}
                            value={props.selected ? '' : props.searchText}
                            onKeyDown={(e) => {
                                if (!keys.includes(e.key)) {
                                    return
                                }

                                e.currentTarget.blur()

                                e.stopPropagation()
                            }}
                        />
                    </Dropdown>
                    {(!!props.selected && (
                        <div className={styles['selected-tag-wrapper']}>
                            <div
                                className={styles['selected-tag']}
                                onClick={() => {
                                    props.onChange(null)
                                }}
                            >
                                <div>{props.selected.label}</div>
                                <Icon icon='ic:outline-close' className={styles['close-tag-icon']} />
                            </div>
                        </div>
                    )) ||
                        null}
                </div>
            </label>
            {!!props.error && <div className={styles['error']}>{props.error}</div>}
        </div>
    )
}

export { SearchField }
