import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { Listbox } from './Listbox'

const ListboxFixture = (): JSX.Element => {
    const [value, setValue] = useState('alpha')
    return (
        <>
            <Listbox value={value} onChange={setValue}>
                <Listbox.Button data-testid='trigger'>{value}</Listbox.Button>
                <Listbox.Options>
                    <Listbox.Option value='alpha'>Alpha</Listbox.Option>
                    <Listbox.Option value='bravo' disabled>
                        Bravo
                    </Listbox.Option>
                    <Listbox.Option value='charlie'>Charlie</Listbox.Option>
                </Listbox.Options>
            </Listbox>
            <button type='button' data-testid='after'>
                After
            </button>
        </>
    )
}

describe('Listbox keyboard contract', () => {
    afterEach(cleanup)

    it('exposes one trigger tab stop with linked combobox/listbox state (4.1.2)', async () => {
        const { container } = mount(<ListboxFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(trigger)
        await expect(trigger).toHaveAttribute('role', 'combobox')
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await expect(trigger).not.toHaveAttribute('aria-controls')

        await userEvent.keyboard('{ArrowDown}')
        const list = document.querySelector<HTMLElement>('[role="listbox"]')!
        await waitFor(() => expect(list).not.toBeNull())
        await expect(trigger).toHaveAttribute('aria-controls', list.id)
        await expect(list.querySelectorAll('[role="option"][tabindex="0"]')).toHaveLength(0)
    })

    it('keeps focus on the trigger while navigating and selecting options (2.1.1, 2.4.3)', async () => {
        const { container } = mount(<ListboxFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()

        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        await userEvent.keyboard('{ArrowDown}')

        const activeId = trigger.getAttribute('aria-activedescendant')!
        await expect(document.activeElement).toBe(trigger)
        await expect(document.getElementById(activeId)).toHaveTextContent('Charlie')
        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
        await expect(trigger).toHaveTextContent('charlie')
        await expect(document.activeElement).toBe(trigger)
    })

    it('selects with Space and exposes explicit option selection state (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<ListboxFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()

        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        await userEvent.keyboard('{ArrowDown}')
        const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
        await expect(options[0]).toHaveAttribute('aria-selected', 'true')
        await expect(options[1]).toHaveAttribute('aria-selected', 'false')

        await userEvent.keyboard(' ')

        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
        await expect(trigger).toHaveTextContent('charlie')
        await expect(document.activeElement).toBe(trigger)
    })

    it('supports Home, End, Escape and Tab without trapping focus (2.1.1, 2.1.2)', async () => {
        const { container } = mount(<ListboxFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()

        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        await userEvent.keyboard('{End}')
        await waitFor(() => expect(trigger).toHaveAttribute('aria-activedescendant'))
        await expect(document.getElementById(trigger.getAttribute('aria-activedescendant')!)).toHaveTextContent('Charlie')

        await userEvent.keyboard('{Home}')
        await expect(document.getElementById(trigger.getAttribute('aria-activedescendant')!)).toHaveTextContent('Alpha')

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
        await expect(document.activeElement).toBe(trigger)

        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        await userEvent.tab()
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
        await expect(document.activeElement).toBe(container.querySelector('[data-testid="after"]'))
    })

    it('keeps a consumer onClick and indexes options past non-option children (2.1.1)', async () => {
        const onClick = fn()
        const { container } = mount(
            <Listbox value='alpha' onChange={() => undefined}>
                <Listbox.Button data-testid='trigger' onClick={onClick}>
                    alpha
                </Listbox.Button>
                <Listbox.Options>
                    {/* A divider is not an option — it must not consume an index nor receive the
                        internal `optionIndex` prop. */}
                    <hr data-testid='divider' />
                    <Listbox.Option value='alpha'>Alpha</Listbox.Option>
                    <Listbox.Option value='charlie'>Charlie</Listbox.Option>
                </Listbox.Options>
            </Listbox>,
        )
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!

        await userEvent.click(trigger)
        await expect(onClick).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

        await expect(container.querySelector('[data-testid="divider"]')).not.toHaveAttribute('optionindex')
        // The divider must not consume index 0, or every option's id and arrow-key target shifts.
        const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
        await expect(options[0]!.id.endsWith('-option-0')).toBe(true)
        await expect(options[1]!.id.endsWith('-option-1')).toBe(true)

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.getElementById(trigger.getAttribute('aria-activedescendant')!)).toHaveTextContent('Alpha')
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.getElementById(trigger.getAttribute('aria-activedescendant')!)).toHaveTextContent('Charlie')
    })

    it('supports pointer selection and outside-click dismissal without moving focus into an option (2.1.1, 2.4.3)', async () => {
        const { container } = mount(<ListboxFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()

        await userEvent.click(trigger)
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))[2]!
        await userEvent.click(option)

        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
        await expect(trigger).toHaveTextContent('charlie')
        await expect(document.activeElement).toBe(trigger)

        await userEvent.click(trigger)
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        await userEvent.click(container.querySelector('[data-testid="after"]')!)
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
    })
    it('keeps focusable content inside an option reachable and usable (2.1.1)', async () => {
        // The directory sidebar renders its recipient search field inside a disabled option, so the
        // panel is not a list of inert rows: Tab has to reach that field, and the pointer-focus
        // guard that keeps DOM focus on the trigger must not swallow a click aimed at it.
        const { container } = mount(
            <>
                <Listbox value='alpha' onChange={() => undefined}>
                    <Listbox.Button data-testid='trigger'>alpha</Listbox.Button>
                    <Listbox.Options>
                        <Listbox.Option disabled value='search'>
                            <input data-testid='search' placeholder='search' />
                        </Listbox.Option>
                        <Listbox.Option value='alpha'>Alpha</Listbox.Option>
                    </Listbox.Options>
                </Listbox>
                <button type='button' data-testid='after'>
                    After
                </button>
            </>,
        )
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

        await userEvent.tab()
        await expect(document.activeElement).toBe(document.querySelector('[data-testid="search"]'))
        await expect(document.querySelector('[role="listbox"]')).not.toBeNull()

        // A click on the field must keep its default action — that is what focuses it. (Asserted on
        // the event rather than through a real click: the row is `aria-disabled`, which the driver
        // refuses to click into, while a browser focuses the field just fine.)
        const onField = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
        document.querySelector('[data-testid="search"]')!.dispatchEvent(onField)
        await expect(onField.defaultPrevented).toBe(false)

        // A click on a bare row still must not: the trigger owns DOM focus.
        const onRow = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
        Array.from(document.querySelectorAll('[role="option"]'))[1]!.dispatchEvent(onRow)
        await expect(onRow.defaultPrevented).toBe(true)
    })

    it('closes on Escape pressed inside the panel and returns focus to the trigger (2.1.1, 2.4.3)', async () => {
        const { container } = mount(
            <Listbox value='alpha' onChange={() => undefined}>
                <Listbox.Button data-testid='trigger'>alpha</Listbox.Button>
                <Listbox.Options>
                    <Listbox.Option disabled value='search'>
                        <input data-testid='search' placeholder='search' />
                    </Listbox.Option>
                    <Listbox.Option value='alpha'>Alpha</Listbox.Option>
                </Listbox.Options>
            </Listbox>,
        )
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        document.querySelector<HTMLInputElement>('[data-testid="search"]')!.focus()

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
        // Closing must not strand focus on <body> — the panel the user was in has just unmounted.
        await expect(document.activeElement).toBe(trigger)
    })

    it('leaves no dangling aria-activedescendant when nothing is selectable (4.1.2)', async () => {
        const { container } = mount(
            <Listbox value='x' onChange={() => undefined}>
                <Listbox.Button data-testid='trigger'>x</Listbox.Button>
                <Listbox.Options>
                    <Listbox.Option disabled value='only'>
                        Only
                    </Listbox.Option>
                </Listbox.Options>
            </Listbox>,
        )
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

        for (const key of ['{Home}', '{End}', '{ArrowDown}', '{ArrowUp}']) {
            await userEvent.keyboard(key)
            const active = trigger.getAttribute('aria-activedescendant')
            await expect(active === null || document.getElementById(active) !== null).toBe(true)
        }
    })

    it('scrolls the active option into view while arrowing (2.4.7)', async () => {
        // `aria-activedescendant` moves no DOM focus, so the browser scrolls nothing by itself.
        const { container } = mount(
            <Listbox value='opt-0' onChange={() => undefined}>
                <Listbox.Button data-testid='trigger'>opt-0</Listbox.Button>
                <Listbox.Options className='block h-[60px] overflow-y-auto'>
                    {Array.from({ length: 30 }, (_, index) => (
                        <Listbox.Option key={index} value={`opt-${index}`}>
                            <span className='block h-5'>{`Option ${index}`}</span>
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>,
        )
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        for (let i = 0; i < 12; i++) await userEvent.keyboard('{ArrowDown}')

        const list = document.querySelector<HTMLElement>('[role="listbox"]')!
        const active = document.getElementById(trigger.getAttribute('aria-activedescendant')!)!
        await expect(active).toHaveTextContent('Option 12')
        await waitFor(async () => {
            const listRect = list.getBoundingClientRect()
            const activeRect = active.getBoundingClientRect()
            await expect(activeRect.top).toBeGreaterThanOrEqual(listRect.top - 1)
            await expect(activeRect.bottom).toBeLessThanOrEqual(listRect.bottom + 1)
        })
    })
})
