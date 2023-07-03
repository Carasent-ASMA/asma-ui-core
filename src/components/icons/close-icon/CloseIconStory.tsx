import type { ComponentStory } from '@storybook/react'
import { CloseIcon } from './CloseIcon'

export const CloseIconStory = () => {
    const Template: ComponentStory<typeof CloseIcon> = (args) => <CloseIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
