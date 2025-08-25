import React from 'react'
//import style from './StyledWidgetHeader.module.scss'
import { StyledWidgetHeader } from './StyledWidgetHeader'
import type { Meta } from '@storybook/react'
import { StyledButton } from 'src/components/inputs/button'
import { CloseIcon } from 'asma-ui-icons'

const meta = {
    title: 'Widgets/StyledWidgetHeader',
    component: StyledWidgetHeader,
    tags: [],
    argTypes: {},
    args: {
        title: '',
        actions: <></>,
    },
} satisfies Meta<typeof StyledWidgetHeader>

export default meta

export const WidgetHeader = () => {
    return (
        <StyledWidgetHeader
            title='Widget header example'
            actions={
                <div className='w-full flex justify-between'>
                    <StyledButton
                        dataTest='clear-selected-button'
                        variant='text'
                        startIcon={<CloseIcon height={24} width={24} className='text-gama-500' />}
                    >
                        3 selected
                    </StyledButton>
                    <StyledButton dataTest='header-button' size='small'>
                        Button
                    </StyledButton>
                </div>
            }
            actionsClassname='w-full'
        />
    )
}
