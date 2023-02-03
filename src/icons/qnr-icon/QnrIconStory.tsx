import type { ComponentStory } from '@storybook/react'
import { QnrIcon } from './QnrIcon'

export const QnrIconStory = () => {
    const Template: ComponentStory<typeof QnrIcon> = (args) => <QnrIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
