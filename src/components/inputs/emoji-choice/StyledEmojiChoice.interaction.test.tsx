import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledEmojiChoice, type EmojiChoiceOption, type StyledEmojiChoiceProps } from './StyledEmojiChoice'

const QUESTION = 'Which statement fits your week best?'

const THREE: EmojiChoiceOption[] = [
    { value: 'help', emoji: '☹️', label: 'I needed a lot of help this week, and I would like to talk about adjusting my support plan' },
    { value: 'some', emoji: '😐', label: 'I needed some help with daily tasks' },
    { value: 'own', emoji: '😊', label: 'I managed on my own' },
]

const SIX: EmojiChoiceOption[] = [
    ...THREE,
    { value: 'good', emoji: '😀', label: 'A good week' },
    { value: 'great', emoji: '😄', label: 'A great week' },
    { value: 'best', emoji: '🤩', label: 'The best week' },
]

type FixtureProps = Partial<StyledEmojiChoiceProps> & { onChange?: (value: string) => void; width?: number }

const Fixture = ({ onChange, width = 632, value: initial = null, ...props }: FixtureProps): JSX.Element => {
    const [value, setValue] = useState(initial)
    return (
        <div style={{ width }}>
            <StyledEmojiChoice
                dataTest='emoji'
                question={QUESTION}
                options={THREE}
                {...props}
                value={value}
                onValueChange={(next) => {
                    setValue(next)
                    onChange?.(next)
                }}
            />
            <button type='button'>After</button>
        </div>
    )
}

const radios = (container: HTMLElement): HTMLInputElement[] => [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
const cards = (container: HTMLElement): HTMLElement[] => [...container.querySelectorAll<HTMLElement>('label')]

describe('StyledEmojiChoice radio list', () => {
    afterEach(cleanup)

    it('is a group named by the question, one radio per option, named by its text without the emoji', async () => {
        const { container } = mount(<Fixture />)
        const group = container.querySelector('fieldset')!

        await expect(group).toHaveAccessibleName(QUESTION)
        await expect(radios(container)).toHaveLength(3)
        await expect(new Set(radios(container).map((radio) => radio.name)).size).toBe(1)
        await expect(radios(container)[1]).toHaveAccessibleName('I needed some help with daily tasks')
        await expect(container.querySelector('[role="combobox"]')).toBeNull()
    })

    it('takes its name from a heading the page renders, and shows no question of its own', async () => {
        const { container } = mount(
            <>
                <h2 id='q'>{QUESTION}</h2>
                <Fixture aria-labelledby='q' />
            </>,
        )

        await expect(container.querySelector('legend')).toBeNull()
        await expect(container.querySelector('fieldset')).toHaveAccessibleName(QUESTION)
    })

    it('selects an option from a click anywhere on its card', async () => {
        const onChange = fn()
        const { container } = mount(<Fixture onChange={onChange} />)
        const emoji = cards(container)[0]!.querySelector('[aria-hidden="true"]:not([data-checked]):not([data-unchecked])')!

        await userEvent.click(container.querySelector('label:nth-of-type(2) span span:last-child')!)
        await expect(radios(container)[1]).toBeChecked()
        await userEvent.click(emoji)
        await expect(radios(container)[0]).toBeChecked()
        await expect(onChange.mock.calls).toEqual([['some'], ['help']])
    })

    it('moves with the arrow keys, selects with Space, and Enter chooses without submitting the form', async () => {
        const onSubmit = fn((event: SubmitEvent) => event.preventDefault())
        const { container } = mount(
            <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
                <Fixture />
            </form>,
        )

        await userEvent.tab()
        await expect(document.activeElement).toBe(radios(container)[0])
        await userEvent.keyboard('{Enter}')
        await expect(radios(container)[0]).toBeChecked()
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(radios(container)[1])
        await expect(radios(container)[1]).toBeChecked()
        await userEvent.tab()
        await expect(document.activeElement).toBe(container.querySelector('button'))
        await expect(onSubmit).not.toHaveBeenCalled()
    })

    it('draws the Figma card: 88px emoji in a 100px slot, 16/24 text, at least 44px tall', async () => {
        const { container } = mount(<Fixture />)
        const card = cards(container)[2]!
        const slot = card.querySelector<HTMLElement>('[aria-hidden="true"]:not([data-checked]):not([data-unchecked])')!.parentElement!
        const text = [...card.querySelectorAll<HTMLElement>('span')].find((span) => span.textContent === 'I managed on my own')!

        await expect(slot.getBoundingClientRect().width).toBe(100)
        await expect(slot.getBoundingClientRect().height).toBe(100)
        await expect(getComputedStyle(slot.firstElementChild!).fontSize).toBe('88px')
        await expect(getComputedStyle(text).fontSize).toBe('16px')
        await expect(getComputedStyle(text).lineHeight).toBe('24px')
        await expect(getComputedStyle(text).color).toBe('rgb(73, 82, 95)')
        await expect(card.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
        // Figma: 8px padding, the 40px radio, 8px gap — inside the 1px border.
        await expect(slot.getBoundingClientRect().left - card.getBoundingClientRect().left).toBe(57)
    })

    it('keeps the radio and the emoji in the same place in every card, whatever the text length', async () => {
        const { container } = mount(<Fixture />)
        const slots = cards(container).map((card) => card.querySelector('[aria-hidden="true"]:not([data-checked]):not([data-unchecked])')!.parentElement!)
        const lefts = slots.map((slot) => slot.getBoundingClientRect().left - slot.closest('label')!.getBoundingClientRect().left)

        await expect(new Set(lefts).size).toBe(1)
    })

    it('marks the selected card with the selected tokens and keeps its size', async () => {
        const { container } = mount(<Fixture value='some' />)
        const [plain, selected] = cards(container)
        const style = getComputedStyle(selected!)

        // Default theme: bg/selected = gama-25, border/selected = gama-400 drawn 2px (1px border + 1px inset).
        await expect(style.backgroundColor).toBe('rgb(242, 248, 251)')
        await expect(style.borderTopColor).toBe('rgb(77, 166, 207)')
        await expect(style.boxShadow).toBe('rgb(77, 166, 207) 0px 0px 0px 1px inset')
        await expect(getComputedStyle(plain!).borderTopColor).toBe('rgb(189, 196, 207)')
        await expect(selected!.getBoundingClientRect().height).toBe(plain!.getBoundingClientRect().height)
    })

    it('shows a 3px focus edge in the focus-ring colour on the focused card, also when it is selected (2.4.7)', async () => {
        const { container } = mount(<Fixture value='help' />)

        await userEvent.tab()
        const card = cards(container)[0]!
        const style = getComputedStyle(card)

        await expect(document.activeElement).toBe(radios(container)[0])
        await expect(style.borderTopColor).toBe('rgb(0, 124, 181)')
        await expect(style.boxShadow).toBe('rgb(0, 124, 181) 0px 0px 0px 2px inset')
    })

    it('links the error text to the group', async () => {
        const { container } = mount(<Fixture error helperText='Choose an answer' />)
        const group = container.querySelector('fieldset')!

        await expect(group).toHaveAccessibleDescription('Choose an answer')
    })

    it('names an option without text by its emoji', async () => {
        const options = THREE.map((option) => ({ ...option, label: '' }))
        const { container } = mount(<Fixture options={options} />)

        await expect(radios(container)[1]).toHaveAccessibleName('😐')
        await expect(cards(container)[1]!.getBoundingClientRect().width).toBeLessThan(200)
    })

    it('shows an uploaded emoji image at 88px', async () => {
        const options = [{ value: 'img', label: 'Uploaded', emojiImageSrc: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' }]
        const { container } = mount(<Fixture options={options} />)
        const image = container.querySelector('img')!

        await expect(image).toHaveAttribute('alt', '')
        await expect(image.getBoundingClientRect().width).toBe(88)
        await expect(radios(container)[0]).toHaveAccessibleName('Uploaded')
    })

    it('reflows at 320px with 200% zoom: text under the radio and emoji, nothing cut off or scrolling (1.4.10)', async () => {
        const { container } = mount(<Fixture width={128} />)
        const card = cards(container)[0]!
        const text = [...card.querySelectorAll<HTMLElement>('span')].find((span) => span.textContent?.startsWith('I needed a lot'))!
        const slot = card.querySelector('[aria-hidden="true"]:not([data-checked]):not([data-unchecked])')!.parentElement!

        await expect(text.getBoundingClientRect().top).toBeGreaterThanOrEqual(slot.getBoundingClientRect().bottom)
        await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth)
        await expect(text.getBoundingClientRect().right).toBeLessThanOrEqual(card.getBoundingClientRect().right)
    })
})

describe('StyledEmojiChoice dropdown', () => {
    afterEach(cleanup)

    it('turns into a combobox above 5 options and shows the chosen emoji and text in the field', async () => {
        const { container } = mount(<Fixture options={SIX} value='own' />)
        const combobox = container.querySelector<HTMLInputElement>('[role="combobox"]')!

        await expect(container.querySelector('fieldset')).toBeNull()
        await expect(combobox).toHaveAccessibleName(QUESTION)
        await expect(combobox.value).toBe('I managed on my own')
        await expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('😊')
    })

    it('shows the emoji of an option without text once in the field', async () => {
        const options = SIX.map((option) => ({ ...option, label: '' }))
        const { container } = mount(<Fixture options={options} value='own' />)
        const field = container.querySelector<HTMLInputElement>('[role="combobox"]')!

        await expect(field.value).toBe('😊')
        await expect(field.closest('[data-field-width]')!.textContent).not.toContain('😊')
    })

    it('opens a listbox of the same cards, the field value selected, 2 cards and part of a third in view', async () => {
        const { container } = mount(<Fixture options={SIX} value='some' />)

        await userEvent.click(container.querySelector('[role="combobox"]')!)
        const listbox = await waitFor(() => document.querySelector<HTMLElement>('[role="listbox"]')!)
        const options = [...listbox.querySelectorAll<HTMLElement>('[role="option"]')]
        const selected = options.find((option) => option.getAttribute('aria-selected') === 'true')!

        await expect(options).toHaveLength(6)
        await expect(selected).toHaveAccessibleName('I needed some help with daily tasks')
        await expect(listbox.getBoundingClientRect().height).toBeLessThanOrEqual(340)
        await expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight)
        const first = options[0]!.getBoundingClientRect()
        const third = options[2]!.getBoundingClientRect()
        await expect(third.top).toBeLessThan(listbox.getBoundingClientRect().bottom)
        await expect(first.height).toBeGreaterThan(100)
    })

    it('chooses with the arrow keys and Enter, and closes on Escape', async () => {
        const onChange = fn()
        const { container } = mount(<Fixture options={SIX} onChange={onChange} />)
        const combobox = container.querySelector<HTMLInputElement>('[role="combobox"]')!

        combobox.focus()
        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard('{Enter}')
        await expect(onChange).toHaveBeenCalledWith('some')
        await expect(combobox.value).toBe('I needed some help with daily tasks')

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.querySelector('[role="listbox"]')).not.toBeNull()
        await userEvent.keyboard('{Escape}')
        await expect(document.querySelector('[role="listbox"]')).toBeNull()
    })
})

describe('StyledEmojiChoice read-only', () => {
    afterEach(cleanup)

    it('shows only the answer, as a description-list pair, with nothing to select', async () => {
        const { container } = mount(<Fixture readOnly value='some' />)
        const term = container.querySelector('dt')!
        const answer = container.querySelector('dd')!

        await expect(term).toHaveTextContent(QUESTION)
        await expect(answer).toHaveTextContent('I needed some help with daily tasks')
        await expect(answer.querySelector('ul')).not.toBeVisible()
        await expect(container.querySelector('input, [role="radio"], [role="combobox"], [aria-disabled], [disabled]')).toBeNull()
    })

    it('expands every option behind "Show all options (N)", the answer marked, without "disabled" styling', async () => {
        const { container } = mount(<Fixture readOnly value='some' />)
        const toggle = container.querySelector<HTMLButtonElement>('button[aria-expanded]')!
        const list = container.querySelector<HTMLElement>('ul')!

        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        await expect(toggle).toHaveAccessibleName(`Show all options (3) ${QUESTION}`)
        await expect(list).not.toBeVisible()

        await userEvent.click(toggle)
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await expect(toggle).toHaveAccessibleName(`Hide options ${QUESTION}`)
        await expect(list).toBeVisible()
        await expect(list.querySelectorAll('li')).toHaveLength(3)
        await expect(list.querySelectorAll('li')[1]).toHaveTextContent('I needed some help with daily tasks, selected')
        await expect(getComputedStyle(list.querySelector('li span span:last-child')!).color).toBe('rgb(73, 82, 95)')
    })

    it('toggles from the keyboard and keeps the Figma look, no fill, when open', async () => {
        const { container } = mount(<Fixture readOnly value='some' />)
        const toggle = container.querySelector<HTMLButtonElement>('button[aria-expanded]')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(toggle)
        await userEvent.keyboard('{Enter}')
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await expect(getComputedStyle(toggle).backgroundColor).toBe('rgba(0, 0, 0, 0)')
        await userEvent.keyboard(' ')
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('shows the same expanded list for a question that was a dropdown', async () => {
        const { container } = mount(<Fixture readOnly options={SIX} value='best' />)

        await userEvent.click(container.querySelector('button[aria-expanded]')!)
        await expect(container.querySelectorAll('ul > li')).toHaveLength(6)
        await expect(container.querySelector('[role="combobox"]')).toBeNull()
    })

    it('shows and reads "No answer" when nothing was chosen', async () => {
        const { container } = mount(<Fixture readOnly />)

        await expect(container.querySelector('dd')).toHaveTextContent('No answer')
    })

    it('speaks Norwegian', async () => {
        const { container } = mount(<Fixture readOnly locale='no' />)
        const toggle = container.querySelector<HTMLButtonElement>('button[aria-expanded]')!

        await expect(container.querySelector('dd')).toHaveTextContent('Ingen svar')
        await expect(toggle).toHaveTextContent('Vis alle alternativ (3)')
        await userEvent.click(toggle)
        await expect(toggle).toHaveTextContent('Skjul alternativ')
    })

    it('hides the question term visually when the page heading names it', async () => {
        const { container } = mount(<Fixture readOnly aria-labelledby='heading' />)
        const term = container.querySelector('dt')!

        await expect(term).toHaveTextContent(QUESTION)
        await expect(term.getBoundingClientRect().width).toBeLessThanOrEqual(1)
    })
})

describe('StyledEmojiChoice on a phone', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    it('opens the dropdown as a full-screen picker titled by the question', async () => {
        await page.viewport(390, 844)
        const { container } = mount(<Fixture options={SIX} />)

        await userEvent.click(container.querySelector('[role="combobox"]')!)
        const dialog = await waitFor(() => document.querySelector<HTMLDialogElement>('dialog[open]')!)

        await expect(dialog).toHaveTextContent(QUESTION)
        await expect(dialog.querySelectorAll('[role="option"]')).toHaveLength(6)
    })
})
