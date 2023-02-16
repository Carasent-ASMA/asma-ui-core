import type { ComponentStory } from '@storybook/react'
import { DownloadIcon } from './DownloadIcon'

export const DownloadIconStory = () => {
    const Template: ComponentStory<typeof DownloadIcon> = (args) => <DownloadIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
