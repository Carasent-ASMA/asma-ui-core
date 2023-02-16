import type { ComponentStory } from '@storybook/react'
import { CheckBoxCheckedIcon } from './CheckBoxCheckedIcon'

export const CheckBoxCheckedIconStory = () => {
    const Template: ComponentStory<typeof CheckBoxCheckedIcon> = (args) => <CheckBoxCheckedIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
