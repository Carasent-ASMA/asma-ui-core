import { ComponentStory } from '@storybook/react'
import { DashboardViewIcon } from './DashboardViewIcon'

export const DashboardViewIconStory = () => {
    const Template: ComponentStory<typeof DashboardViewIcon> = (args) => <DashboardViewIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
