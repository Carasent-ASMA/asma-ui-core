import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, fn, userEvent, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledRadio } from 'src/components/inputs/radio-button/base-ui/StyledRadio'
import { StyledRadioGroup } from 'src/components/inputs/radio-button/base-ui/StyledRadioGroup'
import { StyledSwitch } from 'src/components/inputs/switch/base-ui/StyledSwitch'
import { StyledFormControlLabel } from './StyledFormControlLabel'

/**
 * ASMA-9001. The option control's target is centred on the FIRST line of the label, and an optional
 * helper/description line starts at the label text indent. A one-line label is unchanged: the
 * first-line centre is where the old `items-center` row put it, for every control target height.
 */

const LONG_LABEL =
    'Show/hide transition: ~300–400 ms slide and fade, matching the recommended duration for a partially persistent header so the button and the header still read as one system.'

const controlHost = (container: HTMLElement): HTMLElement => {
    const label = container.querySelector('label')!
    return label.firstElementChild as HTMLElement
}

/** The label text's line boxes. Wrapped text produces one rect per rendered line. */
const lineRects = (element: Element): DOMRect[] => {
    const range = document.createRange()
    range.selectNodeContents(element)
    return Array.from(range.getClientRects()).filter((rect) => rect.width > 0)
}

const lineCentre = (rect: DOMRect): number => rect.top + rect.height / 2
const boxCentre = (element: Element): number => {
    const rect = element.getBoundingClientRect()
    return rect.top + rect.height / 2
}
const near = (actual: number, expected: number): boolean => Math.abs(actual - expected) <= 0.5

describe('StyledFormControlLabel aligns the control with the first label line (ASMA-9001)', () => {
    afterEach(cleanup)

    it.each([
        ['checkbox', <StyledCheckbox key='c' dataTest='control' />],
        ['radio', <StyledRadio key='r' dataTest='control' value='a' />],
        // A switch is 34px tall, not 40: the measured offset must keep its centre on the line too.
        ['switch', <StyledSwitch key='s' dataTest='control' />],
    ] as const)('%s: one line is centred exactly as before', async (_kind, control) => {
        const { container } = mount(<StyledFormControlLabel label='Receive updates' control={control} />)
        const label = within(container).getByText('Receive updates')
        const [firstLine] = lineRects(label)

        await expect(firstLine, 'the label rendered a line').toBeDefined()
        await expect(near(boxCentre(controlHost(container)), lineCentre(firstLine!))).toBe(true)
    })

    it.each([
        ['checkbox', <StyledCheckbox key='c' dataTest='control' />],
        ['radio', <StyledRadio key='r' dataTest='control' value='a' />],
    ] as const)('%s: a wrapped label keeps the control on the first line', async (_kind, control) => {
        const { container } = mount(
            <div style={{ width: 220 }}>
                <StyledFormControlLabel label={LONG_LABEL} control={control} />
            </div>,
        )
        const label = within(container).getByText(LONG_LABEL)
        const lines = lineRects(label)

        await expect(lines.length, 'the label wrapped onto more than one line').toBeGreaterThan(1)
        await expect(near(boxCentre(controlHost(container)), lineCentre(lines[0]!))).toBe(true)
        await expect(
            near(boxCentre(controlHost(container)), lineCentre(lines[lines.length - 1]!)),
            'the control is not centred on the whole text block',
        ).toBe(false)
    })

    it('keeps a vertical placement centred with no first-line margin', async () => {
        const { container } = mount(
            <StyledFormControlLabel
                labelPlacement='top'
                label='Receive updates'
                helperText='We only send messages about your appointments.'
                control={<StyledCheckbox dataTest='control' />}
            />,
        )
        const root = container.querySelector('label')!
        const label = within(container).getByText('Receive updates')

        await expect(getComputedStyle(root).alignItems).toBe('center')
        await expect(getComputedStyle(label).marginBlockStart).toBe('0px')
        await expect(getComputedStyle(label).marginTop).toBe('0px')
    })

    it('puts the helper on the label text indent, directly under the label', async () => {
        const { container } = mount(
            <div style={{ width: 260 }}>
                <StyledFormControlLabel
                    label='Receive updates'
                    helperText='We only send messages about your appointments.'
                    control={<StyledCheckbox dataTest='control' />}
                />
            </div>,
        )
        const label = within(container).getByText('Receive updates')
        const helper = within(container).getByText('We only send messages about your appointments.')
        const labelBox = label.getBoundingClientRect()
        const helperBox = helper.getBoundingClientRect()

        await expect(Math.abs(helperBox.left - labelBox.left) <= 0.5, 'same left indent').toBe(true)
        await expect(helperBox.top, 'starts at or below the label line').toBeGreaterThanOrEqual(labelBox.bottom - 0.5)
    })

    it('keeps the option name as the accessible name and the helper only as the description', async () => {
        const { container } = mount(
            <StyledFormControlLabel
                label='Receive updates'
                helperText='We only send messages about your appointments.'
                control={<StyledCheckbox dataTest='control' />}
            />,
        )
        const control = container.querySelector<HTMLInputElement>('input')!

        await expect(control).toHaveAccessibleName('Receive updates')
        await expect(control).toHaveAccessibleDescription('We only send messages about your appointments.')

        const describedBy = control.getAttribute('aria-describedby')!
        await expect(describedBy.split(' ').length).toBe(1)
        await expect(document.getElementById(describedBy)?.textContent).toBe(
            'We only send messages about your appointments.',
        )
        await expect(control.getAttribute('aria-labelledby')).not.toBe(describedBy)
    })

    it('appends the helper description to a caller-supplied aria-describedby', async () => {
        const { container } = mount(
            <StyledFormControlLabel
                label='Receive updates'
                helperText='We only send messages about your appointments.'
                control={<StyledCheckbox dataTest='control' aria-describedby='external-hint' />}
            />,
        )
        const control = container.querySelector<HTMLInputElement>('input')!
        const describedBy = control.getAttribute('aria-describedby')!.split(' ')

        await expect(describedBy.length).toBe(2)
        await expect(describedBy[0]).toBe('external-hint')
        await expect(document.getElementById(describedBy[1]!)?.textContent).toBe(
            'We only send messages about your appointments.',
        )
    })

    it('does not render an empty helper or point aria-describedby at it', async () => {
        const { container } = mount(
            <StyledFormControlLabel label='Receive updates' helperText='   ' control={<StyledCheckbox dataTest='control' />} />,
        )
        const control = container.querySelector<HTMLInputElement>('input')!

        await expect(container.querySelectorAll('span[id]').length, 'only the label text span carries an id').toBe(1)
        await expect(control).not.toHaveAttribute('aria-describedby')
    })

    it('lands classes.helperText on the helper span', async () => {
        const { container } = mount(
            <StyledFormControlLabel
                label='Receive updates'
                helperText='We only send messages about your appointments.'
                classes={{ helperText: 'consumer-helper-class' }}
                control={<StyledCheckbox dataTest='control' />}
            />,
        )
        const helper = within(container).getByText('We only send messages about your appointments.')

        await expect(helper).toHaveClass('consumer-helper-class')
        await expect(getComputedStyle(helper).fontSize, 'the default secondary style survives').toBe('12px')
        await expect(getComputedStyle(helper).lineHeight).toBe('16px')
    })

    it('keeps the keyboard contract with a helper present', async () => {
        const onChange = fn()
        const { container } = mount(
            <StyledFormControlLabel
                label='Receive updates'
                helperText='We only send messages about your appointments.'
                control={<StyledCheckbox dataTest='control' checked={false} onChange={onChange} />}
            />,
        )
        const control = container.querySelector<HTMLInputElement>('input')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(control)
        await userEvent.keyboard(' ')
        await expect(onChange).toHaveBeenCalledTimes(1)
        await userEvent.keyboard('{Enter}')
        await expect(onChange).toHaveBeenCalledTimes(2)
    })

    it('keeps radio keyboard selection with a helper present', async () => {
        const onChange = fn()
        const { container } = mount(
            <StyledRadioGroup name='contact'>
                <StyledFormControlLabel
                    label='Email'
                    helperText='Replies go to your inbox.'
                    control={<StyledRadio dataTest='email' value='email' onChange={onChange} />}
                />
            </StyledRadioGroup>,
        )
        const control = container.querySelector<HTMLInputElement>('input')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(control)
        await userEvent.keyboard(' ')
        await expect(onChange).toHaveBeenCalled()
        await expect(control).toBeChecked()
    })

    it('keeps a mixed small radio/checkbox list on one icon column and one label indent', async () => {
        const { container } = mount(
            <div className='flex flex-col'>
                <StyledFormControlLabel label='Radio option' control={<StyledRadio dataTest='radio' size='small' value='a' />} />
                <StyledFormControlLabel label='Checkbox option' control={<StyledCheckbox dataTest='checkbox' size='small' />} />
            </div>,
        )
        const [radioRow, checkboxRow] = Array.from((container.firstElementChild as HTMLElement).children)
        const leftOf = (row: Element): number => (row.lastElementChild as HTMLElement).getBoundingClientRect().left

        await expect(leftOf(radioRow!)).toBe(leftOf(checkboxRow!))
        await expect((radioRow!.firstElementChild as HTMLElement).getBoundingClientRect().width).toBe(40)
        await expect((checkboxRow!.firstElementChild as HTMLElement).getBoundingClientRect().width).toBe(40)
    })
})

/**
 * ASMA-9043. The offset lives in `@layer theme` so a consumer's `classes.label` utility still wins.
 * That is deliberately the earliest layer, which means an ordinary declaration there loses to
 * every later layer — and to anything unlayered. Two consumer resets therefore used to zero it:
 * Tailwind v4's preflight (`@layer base { *, ::after, ::before { margin: 0; padding: 0 } }`) and the
 * unlayered `* { box-sizing: border-box; margin: 0; padding: 0 }` that richeditor's `tiptap.css`
 * brings in. The editor ships both, so the control sat a whole half-line above the label.
 *
 * The rules below reproduce exactly those two resets around the mount; the component's own
 * declaration has to outrank them (important, still in `theme`, so it also beats later layers).
 */
const CONSUMER_RESETS = [
    `@layer theme, base, components, utilities;
     @layer base { *, ::after, ::before { margin: 0; padding: 0 } }`,
    `* { box-sizing: border-box; margin: 0; padding: 0 }`,
]

const injectConsumerResets = (): (() => void) => {
    const styles = CONSUMER_RESETS.map((css) => {
        const style = document.createElement('style')
        style.textContent = css
        document.head.appendChild(style)
        return style
    })

    return () => styles.forEach((style) => style.remove())
}

describe('StyledFormControlLabel first-line offset beats consumer resets (ASMA-9043)', () => {
    let removeConsumerResets: () => void

    beforeEach(() => {
        removeConsumerResets = injectConsumerResets()
    })

    afterEach(() => {
        cleanup()
        removeConsumerResets()
    })

    it.each([
        ['checkbox', <StyledCheckbox key='c' dataTest='control' />],
        ['radio', <StyledRadio key='r' dataTest='control' value='a' />],
        ['switch', <StyledSwitch key='s' dataTest='control' />],
    ] as const)('%s: the control stays on the first line', async (_kind, control) => {
        const { container } = mount(<StyledFormControlLabel label='Receive updates' control={control} />)
        const label = within(container).getByText('Receive updates')
        const [firstLine] = lineRects(label)
        const offset = Math.abs(boxCentre(controlHost(container)) - lineCentre(firstLine!))
        const margin = getComputedStyle(label).marginBlockStart

        await expect(firstLine, 'the label rendered a line').toBeDefined()
        await expect(margin, 'the consumer resets did not zero the first-line offset').not.toBe('0px')
        await expect(
            offset,
            `control centre minus first-line centre was ${offset}px (margin-block-start ${margin})`,
        ).toBeLessThanOrEqual(0.5)
    })

    it('a wrapped checkbox label keeps the control on the first line', async () => {
        const { container } = mount(
            <div style={{ width: 220 }}>
                <StyledFormControlLabel label={LONG_LABEL} control={<StyledCheckbox dataTest='control' />} />
            </div>,
        )
        const label = within(container).getByText(LONG_LABEL)
        const lines = lineRects(label)
        const offset = Math.abs(boxCentre(controlHost(container)) - lineCentre(lines[0]!))

        await expect(lines.length, 'the label wrapped onto more than one line').toBeGreaterThan(1)
        await expect(
            offset,
            `control centre minus first-line centre was ${offset}px (margin-block-start ${getComputedStyle(label).marginBlockStart})`,
        ).toBeLessThanOrEqual(0.5)
    })
})
