import { ComponentStory } from '@storybook/react'
import { AsignmentOutlineIcon } from './AsignmentOutlineIcon'

export const AsignmentOutlineIconStory = () => {
    const Template: ComponentStory<typeof AsignmentOutlineIcon> = (args) => <AsignmentOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
