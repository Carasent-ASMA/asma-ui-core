import type { ComponentStory } from '@storybook/react'
import { MessageProcessingIcon } from './MessageProcessingIcon'

export const MessageProcessingIconStory = () => {
    const Template: ComponentStory<typeof MessageProcessingIcon> = (args) => <MessageProcessingIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
