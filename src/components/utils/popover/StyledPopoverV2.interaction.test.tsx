import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, isEntirelyObscured, mount, tabbableWithin } from 'src/test-utils/renderInteraction'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledPopoverV2, type StyledPopoverV2Props } from './StyledPopoverV2'

/**
 * Keyboard & focus contract — StyledPopoverV2 (ASMA-8183).
 * WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 4.1.2.
 *
 * The ticket is explicit that this component has NO `role="menu"` and NO arrow-key navigation —
 * everything inside is reached with Tab. The arrow-key test below is the regression guard for that.
 */

type FixtureProps = Partial<StyledPopoverV2Props> & { label?: string; dataTest?: string }

const Fixture = ({ label = 'Open', dataTest = 'pop', ...props }: FixtureProps): JSX.Element => (
    <StyledPopoverV2
        dataTest={dataTest}
        title='Popover title'
        renderTrigger={({ ref, triggerProps }) => (
            <StyledButton dataTest={`${dataTest}-trigger`} refLink={ref} type='button' {...triggerProps}>
                {label}
            </StyledButton>
        )}
        {...props}
    >
        {props.children ?? 'Supplementary content'}
    </StyledPopoverV2>
)

const ActionFixture = (props: FixtureProps): JSX.Element => (
    <Fixture
        variant='action'
        resetAction={
            <StyledButton dataTest='reset' variant='text' type='button'>
                Nullstill
            </StyledButton>
        }
        {...props}
    >
        <button type='button'>First</button>
        <button type='button'>Second</button>
    </Fixture>
)

const triggerOf = (container: HTMLElement): HTMLButtonElement =>
    container.querySelector<HTMLButtonElement>('button')!

const panelOf = (dataTest = 'pop'): HTMLElement | null =>
    document.body.querySelector<HTMLElement>(`[data-test="${dataTest}"]`)

describe('StyledPopoverV2 — trigger semantics', () => {
    afterEach(cleanup)

    it('keeps aria-expanded in sync on the trigger, both states (4.1.2)', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)

        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await userEvent.click(trigger)
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        await userEvent.keyboard('{Escape}')
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('points aria-controls at the open surface and drops it when closed', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)

        await expect(trigger).not.toHaveAttribute('aria-controls')
        await userEvent.click(trigger)
        await expect(trigger.getAttribute('aria-controls')).toBe(panelOf()!.id)
    })

    it('describes the trigger with an info surface, and marks an action surface as a dialog', async () => {
        const info = mount(<Fixture />)
        await userEvent.click(triggerOf(info.container))
        await expect(triggerOf(info.container)).not.toHaveAttribute('aria-haspopup')
        await expect(triggerOf(info.container).getAttribute('aria-describedby')).toBe(panelOf()!.id)
        info.unmount()

        const action = mount(<ActionFixture dataTest='act' />)
        await userEvent.click(triggerOf(action.container))
        await expect(triggerOf(action.container)).toHaveAttribute('aria-haspopup', 'dialog')
        await expect(triggerOf(action.container)).not.toHaveAttribute('aria-describedby')
    })

    it('opens from the keyboard with Enter on the trigger (2.1.1)', async () => {
        const { container } = mount(<Fixture />)
        triggerOf(container).focus()

        await userEvent.keyboard('{Enter}')
        await expect(panelOf()).not.toBeNull()
    })
})

describe('StyledPopoverV2 — info variant', () => {
    afterEach(cleanup)

    it('is a plain container, not a dialog, and takes focus itself on open', async () => {
        const { container } = mount(<Fixture />)
        await userEvent.click(triggerOf(container))

        const panel = panelOf()!
        await expect(panel).not.toHaveAttribute('role')
        await expect(panel.tabIndex).toBe(-1)
        await expect(document.activeElement).toBe(panel)
    })

    it('is not trapped — Tab leaves the surface and closes it', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        // Tab off the container, past the close control, and out of the surface entirely.
        await userEvent.keyboard('{Tab}{Tab}')
        await expect(panelOf()).toBeNull()
    })

    it('returns focus to the trigger on Escape (2.4.3)', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.keyboard('{Escape}')
        await expect(panelOf()).toBeNull()
        await expect(document.activeElement).toBe(trigger)
    })
})

describe('StyledPopoverV2 — action variant', () => {
    afterEach(cleanup)

    it('exposes role=dialog named by its title (4.1.2)', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))

        const panel = panelOf()!
        await expect(panel).toHaveAttribute('role', 'dialog')
        await expect(panel).toHaveAccessibleName('Popover title')
    })

    it('falls back to ariaLabel when the surface has no title', async () => {
        const { container } = mount(<ActionFixture title={undefined} ariaLabel='Filtrer søknader' />)
        await userEvent.click(triggerOf(container))

        await expect(panelOf()).toHaveAccessibleName('Filtrer søknader')
    })

    it('moves focus to the first control on open', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))

        await expect(document.activeElement).toHaveTextContent('First')
    })

    it('traps focus and cycles within the surface (2.1.2)', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))
        const panel = panelOf()!

        for (let press = 0; press < tabbableWithin(panel).length + 1; press += 1) {
            await userEvent.keyboard('{Tab}')
            await expect(panel.contains(document.activeElement)).toBe(true)
        }
    })

    it('does NOT respond to arrow keys — this is a dialog, not a menu', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))
        const focusedOnOpen = document.activeElement

        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Home}{End}')

        await expect(document.activeElement).toBe(focusedOnOpen)
        await expect(panelOf()).not.toBeNull()
    })

    it('lets a footer slot close the surface too — the Figma "View results (3)" affordance', async () => {
        const { container } = mount(
            <ActionFixture
                viewResultsAction={({ close }) => (
                    <button type='button' data-testid='view-results' onClick={close}>
                        Vis resultater (3)
                    </button>
                )}
            />,
        )
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.click(document.body.querySelector<HTMLButtonElement>('[data-testid="view-results"]')!)
        await expect(panelOf()).toBeNull()
        await expect(document.activeElement).toBe(trigger)
    })

    it('lets content close the surface via the render-prop, returning focus (Actions pattern)', async () => {
        const { container } = mount(
            <Fixture variant='action'>
                {({ close }) => (
                    <button type='button' onClick={close}>
                        Arkiver
                    </button>
                )}
            </Fixture>,
        )
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.click(document.body.querySelector<HTMLButtonElement>('[data-test="pop"] button')!)
        await expect(panelOf()).toBeNull()
        await expect(document.activeElement).toBe(trigger)
    })
})

describe('StyledPopoverV2 — dismissal', () => {
    afterEach(cleanup)

    it('closes from the close control and returns focus to the trigger', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.click(document.body.querySelector<HTMLButtonElement>('[data-testid="pop-close"]')!)
        await expect(panelOf()).toBeNull()
        await expect(document.activeElement).toBe(trigger)
    })

    it('closes on an outside press and returns focus to the trigger', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.click(document.body)
        await expect(panelOf()).toBeNull()
        await expect(document.activeElement).toBe(trigger)
    })

    // Regression guard for `guards={false}`: the action variant is modal, so Floating UI marks the
    // rest of the page `inert`. Inert content must still be able to swallow the dismissing press.
    it('closes the modal action variant on an outside press too', async () => {
        const { container } = mount(<ActionFixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)
        await expect(panelOf()).not.toBeNull()

        await userEvent.click(document.body)
        await expect(panelOf()).toBeNull()
    })

    it('toggles shut when the trigger itself is pressed again', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)

        await userEvent.click(trigger)
        await expect(panelOf()).not.toBeNull()
        await userEvent.click(trigger)
        await expect(panelOf()).toBeNull()
    })

    it('keeps only one popover open — opening a second closes the first', async () => {
        // Spread the triggers apart: the first popover would otherwise paint over the second
        // trigger and Playwright refuses to click through an intercepting element.
        const { container } = mount(
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 900 }}>
                <Fixture dataTest='first' label='First' />
                <Fixture dataTest='second' label='Second' />
            </div>,
        )
        const [firstTrigger, secondTrigger] = Array.from(container.querySelectorAll('button'))

        await userEvent.click(firstTrigger!)
        await expect(panelOf('first')).not.toBeNull()

        await userEvent.click(secondTrigger!)
        await expect(panelOf('first')).toBeNull()
        await expect(panelOf('second')).not.toBeNull()
    })
})

describe('StyledPopoverV2 — focus visibility', () => {
    afterEach(cleanup)

    it('does not entirely obscure its own trigger while open (2.4.11)', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await expect(panelOf()).not.toBeNull()
        await expect(isEntirelyObscured(trigger)).toBe(false)
    })
})
