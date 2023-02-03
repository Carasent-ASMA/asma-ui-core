import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { ShelldevTopbar as ShelldevTopbarComponent } from './ShelldevTopbar'

const meta: ComponentMeta<typeof ShelldevTopbarComponent> = {
    title: 'ShelldevTopbar',
}

export default meta

const Template: ComponentStory<typeof ShelldevTopbarComponent> = (args) => <ShelldevTopbarComponent {...args} />

export const ShelldevTopbar = Template.bind({})
