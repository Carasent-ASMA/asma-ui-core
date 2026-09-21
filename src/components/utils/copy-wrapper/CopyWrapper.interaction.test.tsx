import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { CopyWrapper } from './CopyWrapper'

describe('CopyWrapper keyboard contract', () => {
    afterEach(cleanup)

    it('keeps the copy action in the tab order and reveals it on focus (2.1.1)', async () => {
        const { container } = mount(
            <CopyWrapper contentToCopy='secret' locale='en' messageInfo={() => () => undefined}>
                <span>Secret</span>
            </CopyWrapper>,
        )
        const copy = container.querySelector<HTMLButtonElement>('[data-testid="copy-button"]')!

        await userEvent.tab()

        await expect(document.activeElement).toBe(copy)
        await expect(copy).toHaveAccessibleName('Copy')
        await expect(getComputedStyle(copy.parentElement!).opacity).toBe('1')
    })
})
