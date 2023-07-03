import type { ComponentStory } from '@storybook/react'
import { ArchiveIcon } from './ArchiveIcon'

export default { component: ArchiveIcon }
export const ArchiveIconStory = () => {
    const Template: ComponentStory<typeof ArchiveIcon> = (args) => <ArchiveIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
