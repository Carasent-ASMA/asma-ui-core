import type { Meta, StoryObj } from '@storybook/react'

import { StyledFilterMenu } from './StyledFilterMenu'
import { useEffect, useState } from 'react'
import { MenuItem } from '@mui/material'
import { StyledCheckbox } from '../../inputs/checkbox'
import { StyledFormControlLabel } from '../../miscellaneous/StyledFormControlLabel'

const meta: Meta<typeof StyledFilterMenu> = {
    title: 'Utils/Styled Filter Menu',
    component: StyledFilterMenu,
    tags: ['autodocs'],
    args: {},
}

export default meta

type Story = StoryObj<typeof StyledFilterMenu>

export const Menu: Story = {
    args: { ...meta.args },
    render: () => <FilterMenuExample />,
}

const FilterMenuExample = () => {
    const [filterIsActive, setFilterIsActive] = useState(false)

    const [mockData, setMockData] = useState([
        {
            key: '1',
            label: 'First item',
            checked: false,
        },
        {
            key: '2',
            label: 'Second item',
            checked: false,
        },
        {
            key: '3',
            label: 'Third item',
            checked: false,
        },
        {
            key: '4',
            label: 'Fourth item',
            checked: false,
        },
    ])

    const handleCheckboxChange = (key: string) => {
        const obj = mockData.find((o) => o.key === key)
        if (!obj) return

        setMockData((d) =>
            d.map((item) => ({
                ...item,
                checked: obj.key === item.key ? !item.checked : item.checked,
            })),
        )
    }

    useEffect(() => {
        setFilterIsActive(() => {
            const trueValues = mockData.reduce((count, obj) => (obj.checked ? count + 1 : count), 0)
            return !!trueValues
        })
    }, [mockData])

    return (
        <div className='w-full flex flex-col gap-8 items-center'>
            <StyledFilterMenu
                filterIsActive={filterIsActive}
                dataTest='filter-menu-example'
                popoverContent={
                    <>
                        {mockData.map(({ key, label, checked }) => (
                            <MenuItem key={key} className={`${checked ? 'bg-gama-50' : ''} h-12`}>
                                <StyledFormControlLabel
                                    label={label}
                                    control={<StyledCheckbox dataTest='menu-item-checkbox' disableRipple />}
                                    checked={checked}
                                    onChange={() => handleCheckboxChange(key)}
                                />
                            </MenuItem>
                        ))}
                    </>
                }
            />

            <StyledFilterMenu
                filterIsActive={filterIsActive}
                dataTest='filter-menu-example-2'
                size='small'
                popoverContent={
                    <>
                        {mockData.map(({ key, label, checked }) => (
                            <MenuItem key={key} className={`${checked ? 'bg-primary-50' : ''} h-12`}>
                                <StyledFormControlLabel
                                    label={label}
                                    control={<StyledCheckbox dataTest='menu-item-checkbox' disableRipple />}
                                    checked={checked}
                                    onChange={() => handleCheckboxChange(key)}
                                />
                            </MenuItem>
                        ))}
                    </>
                }
            />
        </div>
    )
}
