import type { ComponentStory } from '@storybook/react'
import { CheckIcon } from './CheckIcon'

export const CheckIconStory = () => {
    const Template: ComponentStory<typeof CheckIcon> = (args) => <CheckIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
