import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { Modal as ModalComponent } from './Modal'

const meta: ComponentMeta<typeof ModalComponent> = {
    title: 'Modal',
    argTypes: { onClose: { action: 'closed' } },
}

export default meta

const Template: ComponentStory<typeof ModalComponent> = (args) => <ModalComponent {...args} />

export const Modal = Template.bind({})

Modal.args = {
    title: 'This is a long Title',
    isOpen: true,
}
