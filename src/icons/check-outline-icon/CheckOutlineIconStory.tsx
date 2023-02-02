import { ComponentStory } from '@storybook/react'
import { CheckOutlineIcon } from './CheckOutlineIcon'

export const CheckOutlineIconStory = () => {
    const Template: ComponentStory<typeof CheckOutlineIcon> = (args) => <CheckOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
