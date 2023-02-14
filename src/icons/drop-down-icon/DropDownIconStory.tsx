import type { ComponentStory } from '@storybook/react'
import { DropDownIcon } from './DropDownIcon'

export const DropDownIconStory = () => {
    const Template: ComponentStory<typeof DropDownIcon> = (args) => <DropDownIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
