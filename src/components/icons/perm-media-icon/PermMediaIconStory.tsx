import type { ComponentStory } from '@storybook/react'
import { PermMediaIcon } from './PermMediaIcon'

export const PermMediaIconStory = () => {
    const Template: ComponentStory<typeof PermMediaIcon> = (args) => <PermMediaIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
