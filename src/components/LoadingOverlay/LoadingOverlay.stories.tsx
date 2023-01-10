import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { LoadingOverlay as LoadingOverlayComponent } from './LoadingOverlay'

const meta: ComponentMeta<typeof LoadingOverlayComponent> = {
    title: 'LoadingOverlay',
    parameters: { actions: { argTypesRegex: '^on.*' } },
}

export default meta

const Template: ComponentStory<typeof LoadingOverlayComponent> = (args) => <LoadingOverlayComponent {...args} />

export const LoadingOverlay = Template.bind({})
