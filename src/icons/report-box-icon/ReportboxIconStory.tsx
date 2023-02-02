import { ComponentStory } from '@storybook/react'
import { ReportboxIcon } from './ReportboxIcon'

export const ReportboxIconStory = () => {
    const Template: ComponentStory<typeof ReportboxIcon> = (args) => <ReportboxIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
