import type { StoryObj, Meta } from '@storybook/react'
import { StyledSelect } from './StyledSelect'
import { StyledSelectItem } from './StyledSelectItem'
import { useState } from 'react'
import { StyledFormControl } from '../../miscellaneous/StyledFormControl'
import { StyledStack } from '../../miscellaneous/StyledStack'
import type { SelectProps } from '@mui/material'
import { StyledTypography } from 'src/components/data-display/typography'

const selectOptions = [
    { title: 'Van Henry', content: 'Van Henry12' },
    { title: 'April Tucker', content: 'April Tucker12' },
    { title: 'Ralph Hubbard', content: 'Ralph Hubbard21' },
]

const meta = {
    title: 'Inputs/Styled Select',
    component: StyledSelect,
    tags: ['autodocs'],
    argTypes: { children: { description: 'The option elements to populate the select with' } },
    args: {
        children: selectOptions.map((option, index) => {
            return (
                <StyledSelectItem key={index} value={option.content}>
                    {option.title}
                </StyledSelectItem>
            )
        }),
    },
} satisfies Meta<typeof StyledSelect>

export default meta
type Story = StoryObj<typeof StyledSelect>

export const Select: Story = {
    render: () => <StyledSelectExample args={meta.args} />,
}

const StyledSelectExample: React.FC<{ args: Partial<SelectProps<unknown>> }> = ({ args }) => {
    const [value, setValue] = useState(selectOptions[0]?.content)
    return (
        <StyledStack direction='column' spacing={2}>
            <StyledTypography variant='h6'>Select size medium</StyledTypography>
            <StyledFormControl fullWidth>
                <StyledSelect
                    {...args}
                    size='medium'
                    value={value}
                    onChange={(e) => {
                        const target: string = e.target.value as string
                        setValue(target)
                    }}
                />
            </StyledFormControl>
            <StyledTypography variant='h6'>Select size small</StyledTypography>
            <StyledFormControl fullWidth>
                <StyledSelect
                    {...args}
                    size='small'
                    value={value}
                    onChange={(e) => {
                        const target: string = e.target.value as string
                        setValue(target)
                    }}
                />
            </StyledFormControl>
        </StyledStack>
    )
}
