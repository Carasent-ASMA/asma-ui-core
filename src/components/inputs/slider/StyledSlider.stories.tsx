import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledSlider } from './StyledSlider'

const meta = {
    title: 'Inputs/Styled Slider',
    component: StyledSlider,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        className: 'max-w-[600px]',
        size: 'medium',
        max: 10,
        min: 1,
        step: 1,
        marks: [
            {
                value: 1,
                label: '1',
            },
            {
                value: 2,
                label: '2',
            },
            {
                value: 3,
                label: '3',
            },
            {
                value: 4,
                label: '4',
            },
            {
                value: 5,
                label: '5',
            },
            {
                value: 6,
                label: '6',
            },
            {
                value: 7,
                label: '7',
            },
            {
                value: 8,
                label: '8',
            },
            {
                value: 9,
                label: '9',
            },
            {
                value: 10,
                label: '10',
            },
        ],
    },
} satisfies Meta<typeof StyledSlider>

export default meta
type Story = StoryObj<typeof StyledSlider>

export const Default: Story = {
    args: {},
    render: (args) => (
        <label className='flex flex-col font-semibold text-base text-delta-800'>
            Default Slider
            <StyledSlider {...args} />
        </label>
    ),
}

export const Disabled: Story = {
    args: { disabled: true },
    render: (args) => (
        <label className='flex flex-col font-semibold text-base text-delta-800'>
            Disabled Slider
            <StyledSlider {...args} />
        </label>
    ),
}

export const HelperText: Story = {
    args: { helperText: 'Custom helper text here' },
    render: (args) => (
        <label className='flex flex-col font-semibold text-base text-delta-800'>
            Slider With Helper Text
            <StyledSlider {...args} />
        </label>
    ),
}

export const Error: Story = {
    args: { error: true, errorText: 'Custom Error text here' },
    render: (args) => (
        <label className='flex flex-col font-semibold text-base text-delta-800'>
            Slider With Error Text
            <StyledSlider {...args} />
        </label>
    ),
}

export const Vertical: Story = {
    args: { orientation: 'vertical' },
    render: (args) => (
        <label className='flex flex-col gap-4 font-semibold text-base text-delta-800 h-[600px]'>
            Vertical Slider
            <StyledSlider {...args} />
        </label>
    ),
}
