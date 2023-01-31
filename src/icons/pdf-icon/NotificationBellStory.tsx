import { ComponentStory } from '@storybook/react'
import { PdfIcon } from './PdfIcon'

export const PdfIconStory = () => {
    const Template: ComponentStory<typeof PdfIcon> = (args) => <PdfIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
