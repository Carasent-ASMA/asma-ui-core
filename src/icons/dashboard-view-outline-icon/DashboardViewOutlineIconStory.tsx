import { ComponentStory } from '@storybook/react'
import { DashboardViewOutlineIcon } from './DashboardViewOutlineIcon'

export const DashboardViewOutlineIconStory = () => {
    const Template: ComponentStory<typeof DashboardViewOutlineIcon> = (args) => <DashboardViewOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
