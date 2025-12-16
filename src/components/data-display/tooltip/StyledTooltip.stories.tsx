import React from 'react'
import type { Meta } from '@storybook/react-vite'
import { StyledTooltip } from './StyledTooltip'
import { StyledButton } from 'src/components/inputs/button'

const meta: Meta = {
    title: 'DataDisplay/Tooltip',
    component: StyledTooltip,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledTooltip>

export default meta

export const Tooltip = () => {
    return (
        <div>
            <StyledTooltip
                title='Tooltip example'
                // addTooltipStyle={{ maxWidth: '50px', height: '500px' }}
                componentsProps={{ tooltip: { style: { maxWidth: '50px' } } }}
            >
                <div className='w-fit'>
                    <StyledButton dataTest='btn'>Hover to see tooltip</StyledButton>
                </div>
            </StyledTooltip>
        </div>
    )
}
