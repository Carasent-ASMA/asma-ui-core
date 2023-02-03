import type { ComponentStory } from '@storybook/react'
import { CheckFactOutlineIcon } from './CheckFactOutlineIcon'

export const CheckFactOutlineIconStory = () => {
    const Template: ComponentStory<typeof CheckFactOutlineIcon> = (args) => <CheckFactOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
