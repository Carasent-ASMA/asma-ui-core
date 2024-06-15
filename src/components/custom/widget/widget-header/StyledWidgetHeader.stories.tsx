import React from 'react'
//import style from './StyledWidgetHeader.module.scss'
import { StyledWidgetHeader } from './StyledWidgetHeader'
import type { Meta } from '@storybook/react'
import { StyledButton } from 'src/components/inputs/button'

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
                <StyledButton dataTest='header-button' size='small'>
                    Button
                </StyledButton>
            }
        />
    )
}
