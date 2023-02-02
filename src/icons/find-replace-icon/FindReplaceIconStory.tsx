import { ComponentStory } from '@storybook/react'
import { FindReplaceIcon } from './FindReplaceIcon'

export const FindReplaceIconStory = () => {
    const Template: ComponentStory<typeof FindReplaceIcon> = (args) => <FindReplaceIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
