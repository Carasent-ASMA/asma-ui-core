import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterIcon } from 'asma-ui-icons'
import { StyledButton } from 'src/components/inputs/button'
import { expect, waitFor, within } from 'storybook/test'
import { StyledTooltip } from './StyledTooltip'

const meta: Meta = {
    title: 'DataDisplay/Tooltip',
    component: StyledTooltip,
    tags: [],
    argTypes: {
        placement: {
            control: 'select',
            options: [
                'bottom',
                'bottom-end',
                'bottom-start',
                'top',
                'top-end',
                'top-start',
                'left',
                'left-end',
                'left-start',
                'right',
                'right-end',
                'right-start',
            ],
        },
    },
    args: {
        arrow: false,
        children: (
            <div className='w-fit'>
                <StyledButton dataTest='hover-btn'>Hover to see tooltip</StyledButton>
            </div>
        ),
    },
} satisfies Meta<typeof StyledTooltip>

export default meta
type Story = StoryObj<typeof StyledTooltip>

export const Default: Story = {
    args: { title: 'Default', componentsProps: { tooltip: { style: { maxWidth: '50px' } } } },
}

export const Arrow: Story = {
    args: { arrow: true, title: 'With arrow' },
}

export const IconButton: Story = {
    args: {
        title: 'Icon button',
        children: (
            <div className='w-fit'>
                <StyledButton dataTest='icon-btn' startIcon={<FilterIcon width={24} height={24} />} />
            </div>
        ),
    },
}

export const MaxWidth: Story = {
    args: {
        title: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam fjskljfksjfkdjlkjslkfjsljfkdsljfslfjksdjflsjfkld ',
    },
}

export const Hovered: Story = {
    args: {
        title: 'Tooltip',
        children: (
            <div className='w-fit'>
                <StyledButton dataTest='hovered-btn'>Hovered</StyledButton>
            </div>
        ),
    },
    parameters: { pseudo: { hover: true } },
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)
        const button = canvas.getByRole('button', { name: 'Hovered' })

        await userEvent.hover(button)
        await waitFor(() => {
            expect(canvas.getByRole('tooltip', { name: 'Tooltip' })).toBeInTheDocument()
        })
    },
}
