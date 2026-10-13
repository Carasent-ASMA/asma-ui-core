import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { VirtualizedList } from './VirtualizedList'

describe('VirtualizedList keyboard contract', () => {
    afterEach(cleanup)

    it('puts the scroll container in the tab order (2.1.1)', async () => {
        const { container } = mount(
            <VirtualizedList
                className='h-10 overflow-y-auto'
                dataTest='virtualized-list'
                getItemKey={(item) => item}
                items={['First', 'Second']}
                renderItem={(item) => <div>{item}</div>}
            />,
        )

        const list = container.querySelector<HTMLElement>('[data-testid="virtualized-list"]')!
        await userEvent.tab()

        await expect(document.activeElement).toBe(list)
    })
})
