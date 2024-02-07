import React, { type ReactNode } from 'react'

import { StyledLabel } from './StyledLabel'

import { StyledTypography } from 'src/components/data-display/typography'

export default {
    title: 'StyledLabel',
    component: StyledLabel,
}

const MarginBlock = ({ children }: { children: ReactNode }) => <div className='mb-3'>{children}</div>

export const Default = () => (
    <>
        <StyledTypography className='py-2'>Label/Highlighting</StyledTypography>
        <MarginBlock>
            <StyledLabel dataTest='label good' className='bg-green-500 text-delta-900'>
                Good
            </StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label attention' className='bg-yellow-300 text-delta-900'>
                Attention
            </StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label warning' className='bg-orange-200 text-delta-900'>
                Warning
            </StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label urgent' className='bg-red-200 text-delta-900'>
                Urgent
            </StyledLabel>
        </MarginBlock>

        <StyledTypography className='py-2'>Label/Groups</StyledTypography>
        <MarginBlock>
            <StyledLabel dataTest='label group' className='bg-delta-700 text-white'>
                Group
            </StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label network' className='bg-purple-500 text-white'>
                Network
            </StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label gruppe' className='bg-delta-700 text-white'>
                Gruppe
            </StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label ORG' className='bg-blue-400 text-white'>
                ORG
            </StyledLabel>
        </MarginBlock>

        <StyledTypography className='py-2'>Label/General</StyledTypography>
        <MarginBlock>
            <StyledLabel dataTest='label archived' className='bg-gray-100 text-delta-700'>
                Archived
            </StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label admin'>Admin</StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label parent'>Parent</StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label linked'>Linked</StyledLabel>
        </MarginBlock>
        <MarginBlock>
            <StyledLabel dataTest='label onClick' onClick={() => alert('Click!')}>
                Styled Label + onClick handler
            </StyledLabel>
        </MarginBlock>
    </>
)
