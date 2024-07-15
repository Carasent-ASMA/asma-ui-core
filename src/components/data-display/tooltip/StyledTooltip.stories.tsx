import React from 'react'
import type { Meta } from '@storybook/react'
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
            <StyledTooltip title='Tooltip example'>
                <div className='w-fit'>
                    <StyledButton dataTest='btn'>Hover to see tooltip</StyledButton>
                </div>
            </StyledTooltip>
        </div>
    )
}
