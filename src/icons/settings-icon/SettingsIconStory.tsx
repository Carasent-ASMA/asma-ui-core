import { ComponentStory } from '@storybook/react'
import { SettingsIcon } from './SettingsIcon'

export const SettingsIconStory = () => {
    const Template: ComponentStory<typeof SettingsIcon> = (args) => <SettingsIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
