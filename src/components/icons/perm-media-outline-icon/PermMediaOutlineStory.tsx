import type { ComponentStory } from '@storybook/react'
import { PermMediaOutline } from './PermMediaOutline'

export const PermMediaOutlineStory = () => {
    const Template: ComponentStory<typeof PermMediaOutline> = (args) => <PermMediaOutline {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
