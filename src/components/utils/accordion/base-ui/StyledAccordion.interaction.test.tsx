import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { tabbableWithin } from 'src/helpers/focusable'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledAccordion } from './StyledAccordion'
import { StyledAccordionDetails } from './StyledAccordionDetails'
import { StyledAccordionSummary } from './StyledAccordionSummary'

const AccordionFixture = (): JSX.Element => {
    const [open, setOpen] = useState(true)
    return (
        <>
            <button
                type='button'
                data-testid='close-programmatically'
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setOpen(false)}
            >
                Close
            </button>
            <button type='button' data-testid='elsewhere'>
                Elsewhere
            </button>
            <StyledAccordion expanded={open} onChange={setOpen}>
                <StyledAccordionSummary>Details</StyledAccordionSummary>
                <StyledAccordionDetails>
                    <PanelContent />
                </StyledAccordionDetails>
            </StyledAccordion>
        </>
    )
}

const PanelContent = (): JSX.Element => (
    <>
        <StyledButton dataTest='panel-action'>Action</StyledButton>
        <StyledInputField dataTest='panel-field' label='Field' />
        <a href='#anchor' data-testid='panel-link'>
            Link
        </a>
    </>
)

describe('StyledAccordion keyboard contract', () => {
    afterEach(cleanup)

    it('removes collapsed panel controls from sequential navigation (2.1.1)', async () => {
        const { container } = mount(
            <StyledAccordion>
                <StyledAccordionSummary>Details</StyledAccordionSummary>
                <StyledAccordionDetails>
                    <PanelContent />
                </StyledAccordionDetails>
            </StyledAccordion>,
        )
        const trigger = container.querySelector<HTMLButtonElement>('button[aria-expanded]')!
        const panel = container.querySelector<HTMLElement>('[role="region"]')!

        // The collapsed panel is only `height: 0` — its controls are still rendered and still have
        // their natural tab stops, so the check is that nothing inside it is reachable at all, not
        // just that the next Tab happened to go elsewhere.
        await expect(tabbableWithin(panel)).toHaveLength(0)

        // The trigger is the accordion's first Tab stop. Focus is placed on it directly rather than
        // reached with a first Tab from wherever the previous test left the document: in a shuffled
        // run, a portal another suite leaked can sit earlier in the sequence (flaky-test report).
        await expect(tabbableWithin(container)[0]).toBe(trigger)
        trigger.focus()
        await expect(document.activeElement).toBe(trigger)
        await userEvent.tab()
        await expect(panel.contains(document.activeElement)).toBe(false)
    })

    it('reaches the panel controls once it is expanded (2.1.1)', async () => {
        // The other half of the same switch: `inert` has to come back off, or the panel's content is
        // permanently unusable by keyboard while looking perfectly available.
        const { container } = mount(
            <StyledAccordion>
                <StyledAccordionSummary>Details</StyledAccordionSummary>
                <StyledAccordionDetails>
                    <PanelContent />
                </StyledAccordionDetails>
            </StyledAccordion>,
        )
        const panel = container.querySelector<HTMLElement>('[role="region"]')!
        const trigger = container.querySelector<HTMLButtonElement>('button[aria-expanded]')!

        // Start on the trigger rather than at whatever the first Tab reaches: in a shuffled run the
        // document's focus starting point is left by the previous test, so Enter could land elsewhere
        // and the accordion never open (failed 1 of 5 in the nightly flaky-test run).
        trigger.focus()
        await expect(document.activeElement).toBe(trigger)
        await userEvent.keyboard('{Enter}')
        await waitFor(() =>
            expect(container.querySelector('button[aria-expanded]')).toHaveAttribute('aria-expanded', 'true'),
        )

        // Every control comes back — the button, the field and the link, in DOM order.
        await expect(tabbableWithin(panel)).toHaveLength(3)
        for (const testid of ['panel-action', 'panel-field', 'panel-link']) {
            await userEvent.tab()
            await expect(document.activeElement).toBe(container.querySelector(`[data-testid="${testid}"]`))
        }
    })

    it('returns focus to the trigger when a controlled accordion closes around it (2.4.3)', async () => {
        const { container } = mount(<AccordionFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('button[aria-expanded]')!
        const action = container.querySelector<HTMLButtonElement>('[data-testid="panel-action"]')!

        action.focus()
        await userEvent.click(container.querySelector('[data-testid="close-programmatically"]')!)
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
        await expect(document.activeElement).toBe(trigger)
    })

    it('leaves focus alone when it closes around nothing (2.4.3)', async () => {
        // The restore must stay conditional. An accordion that collapses while the user works
        // somewhere else — a controlled one reacting to a filter, a route change, a store update —
        // would otherwise yank focus to its own header out of nowhere.
        const { container } = mount(<AccordionFixture />)
        const elsewhere = container.querySelector<HTMLButtonElement>('[data-testid="elsewhere"]')!

        elsewhere.focus()
        await userEvent.click(container.querySelector('[data-testid="close-programmatically"]')!)
        await waitFor(() =>
            expect(container.querySelector('button[aria-expanded]')).toHaveAttribute('aria-expanded', 'false'),
        )

        await expect(document.activeElement).toBe(elsewhere)
    })
})
