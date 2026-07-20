import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledSlider } from './StyledSlider'

const meta = {
    title: 'Inputs/Styled Slider',
    component: StyledSlider,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Slider](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=21289-39224) — rail delta-100 (4px), track/thumb/active-dots gama-500, scale numbers Body Base SemiBold 16 delta-700.',
            },
        },
    },
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

// Regression guard: the thumb must land ON the mark/number at min, mid and max. A native range thumb
// centres at T/2 … (width − T/2), so the visual track/marks are inset by half the thumb; if that
// geometry drifts (e.g. wrong track width / input offset) the thumb slides left of the mark — worst
// at max. These controlled positions lock that alignment in VRT.
export const Positions: Story = {
    render: (args) => (
        <div className='flex max-w-[600px] flex-col gap-8'>
            {[1, 5, 10].map((v) => (
                <StyledSlider key={v} {...args} value={v} />
            ))}
        </div>
    ),
}
