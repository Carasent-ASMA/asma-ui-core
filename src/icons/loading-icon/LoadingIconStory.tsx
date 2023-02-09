import type { ComponentStory } from '@storybook/react'
import { LoadingIcon } from './LoadingIcon'

export const LoadingIconStory = () => {
    const Template: ComponentStory<typeof LoadingIcon> = (args) => <LoadingIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
        color: 'blue',
    }

    return Icon
}
