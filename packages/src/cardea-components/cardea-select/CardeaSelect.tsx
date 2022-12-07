import './CardeaSelect.scss'

import { Icon } from '@iconify/react'
import { Select, SelectProps } from 'antd'
import type { SelectValue } from 'antd/lib/select'
import { useState } from 'react'

export const CardeaSelectOption = Select.Option

export const CardeaSelect = (props: SelectProps<SelectValue>) => {
    const [open, setOpen] = useState(false)

    return (
        <Select
            {...props}
            open={open}
            onDropdownVisibleChange={(o) => setOpen(o)}
            optionFilterProp='children'
            suffixIcon={<SuffixIcon open={open} />}
            className={`cardea-select-wrapper ${props.className ?? ''}`}
            popupClassName={`cardea-select-popup-wrapper ${props.className ?? ''}`}
        >
            {props.children}
        </Select>
    )
}

export const SuffixIcon: React.FC<{ open: boolean }> = ({ open }) => {
    let icon

    if (open) {
        icon = 'material-symbols:arrow-drop-up-rounded'
    } else {
        icon = 'material-symbols:arrow-drop-down-rounded'
    }

    return (
        <button>
            <Icon icon={icon} className='text-delta-800 ' width={30} height={30} />
        </button>
    )
}
