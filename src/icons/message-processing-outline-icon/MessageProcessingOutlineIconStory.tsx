import { ComponentStory } from '@storybook/react'
import { MessageProcessingOutlineIcon } from './MessageProcessingOutlineIcon'

export const MessageProcessingOutlineIconStory = () => {
    const Template: ComponentStory<typeof MessageProcessingOutlineIcon> = (args) => (
        <MessageProcessingOutlineIcon {...args} />
    )

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
