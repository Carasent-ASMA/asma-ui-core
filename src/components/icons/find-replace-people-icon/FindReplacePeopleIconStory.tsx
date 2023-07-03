import type { ComponentStory } from '@storybook/react'
import { FindReplacePeopleIcon } from './FindReplacePeopleIcon'

export const FindReplacePeopleIconStory = () => {
    const Template: ComponentStory<typeof FindReplacePeopleIcon> = (args) => <FindReplacePeopleIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 30,
        height: 30,
    }

    return Icon
}
