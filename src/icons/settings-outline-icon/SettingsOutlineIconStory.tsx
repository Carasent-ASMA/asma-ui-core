import { ComponentStory } from '@storybook/react'
import { SettingsOutlineIcon } from './SettingsOutlineIcon'

export const SettingsOutlineIconStory = () => {
    const Template: ComponentStory<typeof SettingsOutlineIcon> = (args) => <SettingsOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
