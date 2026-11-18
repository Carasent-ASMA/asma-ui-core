import type { ComponentType } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { CallIcon } from './call-icon'
import { CheckReadIcon } from './check-read-icon'
import { EditNotesIcon } from './edit-notes-icon'
import { HistoryToggleOffIcon } from './history-toggle-off-icon'
import { HubIcon, HubIconFilled } from './hub-icon'
import { MoveUpIcon } from './move-up-icon'
import type { SvgIconProps } from './svgIconA11y'
import { WidgetIcon, WidgetIconFilled } from './widgets-icon'

// ASMA-8963: these icons used to render a hard-coded `<title>` ("HubIcon", "Check icon", …) that leaked into the
// accessible name of the link or button around them.
describe.each<[string, ComponentType<SvgIconProps>]>([
    ['CallIcon', CallIcon],
    ['CheckReadIcon', CheckReadIcon],
    ['EditNotesIcon', EditNotesIcon],
    ['HistoryToggleOffIcon', HistoryToggleOffIcon],
    ['HubIcon', HubIcon],
    ['HubIconFilled', HubIconFilled],
    ['MoveUpIcon', MoveUpIcon],
    ['WidgetIcon', WidgetIcon],
    ['WidgetIconFilled', WidgetIconFilled],
])('%s accessible name', (_name, Icon) => {
    afterEach(cleanup)

    it('adds nothing to the name of the link it decorates', async () => {
        const { container } = mount(
            <a href='#plan'>
                <Icon /> Min plan
            </a>,
        )
        const svg = container.querySelector('svg')!

        await expect(within(container).getByRole('link', { name: 'Min plan' })).toBeInTheDocument()
        await expect(svg).toHaveAttribute('aria-hidden', 'true')
        await expect(svg).toHaveAttribute('focusable', 'false')
        await expect(svg.querySelector('title')).toBeNull()
    })

    it('leaves an icon-only button named by its own aria-label', async () => {
        const { container } = mount(
            <button type='button' aria-label='Open hub'>
                <Icon />
            </button>,
        )

        await expect(within(container).getByRole('button', { name: 'Open hub' })).toBeInTheDocument()
    })

    it('is an image named by its title when given one', async () => {
        const { container } = mount(<Icon title='Hub' />)
        const img = within(container).getByRole('img', { name: 'Hub' })

        await expect(img).not.toHaveAttribute('aria-hidden')
        await expect(img.querySelector('title')).toHaveTextContent('Hub')
    })

    it('is an image named by its aria-label when given one', async () => {
        const { container } = mount(<Icon aria-label='Hub' />)

        await expect(within(container).getByRole('img', { name: 'Hub' })).not.toHaveAttribute('aria-hidden')
    })
})
