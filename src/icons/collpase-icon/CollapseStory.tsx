import { ComponentStory } from '@storybook/react'
import { CollapseIcon } from './CollapseIcon'

export const CollapseStory = () => {
    const CollapseTemplate: ComponentStory<typeof CollapseIcon> = (args) => <CollapseIcon {...args} />

    const Collapse = CollapseTemplate.bind({})

    Collapse.args = {
        width: 40,
        height: 40,
    }

    return Collapse
}
