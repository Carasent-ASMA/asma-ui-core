import { ComponentStory } from '@storybook/react'
import { AsignmentIcon } from './AsignmentIcon'

export const AsignmentIconStory = () => {
    const Template: ComponentStory<typeof AsignmentIcon> = (args) => <AsignmentIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
