import type { ComponentStory } from '@storybook/react'
import { AssignmentIcon } from './AssignmentIcon'

export const AssignmentIconStory = () => {
    const Template: ComponentStory<typeof AssignmentIcon> = (args) => <AssignmentIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
