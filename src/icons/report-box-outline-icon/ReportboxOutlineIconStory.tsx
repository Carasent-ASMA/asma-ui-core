import type { ComponentStory } from '@storybook/react'
import { ReportboxOutlineIcon } from './ReportboxOutlineIcon'

export const ReportboxOutlineIconStory = () => {
    const Template: ComponentStory<typeof ReportboxOutlineIcon> = (args) => <ReportboxOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
