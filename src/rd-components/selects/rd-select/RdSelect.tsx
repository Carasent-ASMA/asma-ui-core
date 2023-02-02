import { Icon } from '@iconify/react'
import { Select, SelectProps } from 'antd'
import type { SelectValue } from 'antd/lib/select'
import { useState } from 'react'

export const XSelectOption = Select.Option

export const XSelect = (props: SelectProps<SelectValue>) => {
    const [open, setOpen] = useState(false)

    return (
        <Select
            {...props}
            open={open}
            onDropdownVisibleChange={(o) => setOpen(o)}
            value={props.value}
            onSelect={props.onSelect}
            placeholder={props.placeholder}
            optionFilterProp='children'
            filterOption={props.filterOption}
            onClear={props.onClear}
            onBlur={(data) => {
                props.onBlur?.(data)
            }}
            suffixIcon={<SuffixIcon open={open} />}
            onClick={(data) => {
                props.onClick?.(data)
            }}
            className={`xselect-wrapper ${props.className}`}
            popupClassName={`xselect-popup-wrapper ${props.className}`}
        >
            {props.children}
        </Select>
    )
}

export const SuffixIcon: React.FC<{ open: boolean }> = ({ open }) => {
    let suffixIcon

    if (open) {
        suffixIcon = <Icon icon='ic:round-arrow-drop-up' height='30' />
    } else {
        suffixIcon = <Icon icon='ic:round-arrow-drop-down' height='30' />
    }

    return suffixIcon
}
