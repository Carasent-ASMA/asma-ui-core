import { ComponentStory } from '@storybook/react'
import { CollapseBackIcon } from './CollapseBackIcon'

export const CollapseBackStory = () => {
    const CollapseBackTemplate: ComponentStory<typeof CollapseBackIcon> = (args) => <CollapseBackIcon {...args} />

    const CollapseBack = CollapseBackTemplate.bind({})

    CollapseBack.args = {
        width: 40,
        height: 40,
    }

    return CollapseBack
}
