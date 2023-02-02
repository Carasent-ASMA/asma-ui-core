import { ComponentStory } from '@storybook/react'
import { BellOutlineIcon } from './BellOutlineIcon'

export const BellOutlineIconStory = () => {
    const Template: ComponentStory<typeof BellOutlineIcon> = (args) => <BellOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
