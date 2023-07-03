import type { ComponentStory } from '@storybook/react'
import { AssignmentOutlineIcon } from './AssignmentOutlineIcon'

export const AssignmentOutlineIconStory = () => {
    const Template: ComponentStory<typeof AssignmentOutlineIcon> = (args) => <AssignmentOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
