import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledPopover } from './StyledPopover'

const PopoverFixture = (): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
    const [open, setOpen] = useState(false)

    return (
        <>
            <button type='button' data-testid='before'>
                Before
            </button>
            <button ref={setAnchorEl} type='button' data-testid='trigger' onClick={() => setOpen(true)}>
                Open popover
            </button>
            <StyledPopover open={open} anchorEl={anchorEl} onClose={() => setOpen(false)}>
                <button type='button' data-testid='popover-action'>
                    Popover action
                </button>
                <button type='button' data-testid='popover-action-2'>
                    Popover action 2
                </button>
            </StyledPopover>
            <button type='button' data-testid='after'>
                After
            </button>
        </>
    )
}

const TextPopoverFixture = (): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
    const [open, setOpen] = useState(false)

    return (
        <>
            <button ref={setAnchorEl} type='button' onClick={() => setOpen(true)}>
                Open text popover
            </button>
            <StyledPopover open={open} anchorEl={anchorEl} onClose={() => setOpen(false)}>
                <span data-testid='popover-text'>Popover text</span>
            </StyledPopover>
            <button type='button' data-testid='after-text-popover'>
                After
            </button>
        </>
    )
}

describe('StyledPopover keyboard contract', () => {
    afterEach(cleanup)

    it('closes on Tab and preserves normal forward focus movement', async () => {
        const { container } = mount(<PopoverFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!

        await userEvent.click(trigger)
        const action = await waitFor(async () => {
            const button = document.querySelector<HTMLButtonElement>('[data-testid="popover-action"]')
            await expect(button).not.toBeNull()
            return button!
        })
        action.focus()
        await userEvent.tab()

        await userEvent.tab()

        await waitFor(() => expect(document.querySelector('[data-testid="popover-action"]')).toBeNull())
        await expect(document.activeElement).toBe(container.querySelector('[data-testid="after"]'))
    })

    it('closes a text-only popover when Tab leaves its anchor', async () => {
        const { container } = mount(<TextPopoverFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('button')!

        await userEvent.click(trigger)
        await waitFor(() => expect(document.querySelector('[data-testid="popover-text"]')).not.toBeNull())

        await userEvent.tab()

        await waitFor(() => expect(document.querySelector('[data-testid="popover-text"]')).toBeNull())
        await expect(document.activeElement).toBe(container.querySelector('[data-testid="after-text-popover"]'))
    })

    it('keeps Tab inside the panel until its last control', async () => {
        // Only the two ends leave. In between the panel is an ordinary sequence of controls, and
        // closing there would throw the user out mid-form.
        const { container } = mount(<PopoverFixture />)
        await userEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!)
        const first = await waitFor(async () => {
            const button = document.querySelector<HTMLButtonElement>('[data-testid="popover-action"]')
            await expect(button).not.toBeNull()
            return button!
        })
        first.focus()

        await userEvent.tab()

        await expect(document.activeElement).toBe(document.querySelector('[data-testid="popover-action-2"]'))
        await expect(document.querySelector('[data-testid="popover-action"]')).not.toBeNull()
    })

    it('closes on Shift+Tab out of the panel and retraces to the anchor by default', async () => {
        // The panel is portalled to <body>, but keyboard focus treats it as immediately after the
        // trigger. Backwards from its first control retraces that single step.
        const { container } = mount(<PopoverFixture />)
        await userEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!)
        const first = await waitFor(async () => {
            const button = document.querySelector<HTMLButtonElement>('[data-testid="popover-action"]')
            await expect(button).not.toBeNull()
            return button!
        })
        first.focus()

        await userEvent.tab({ shift: true })

        await waitFor(() => expect(document.querySelector('[data-testid="popover-action"]')).toBeNull())
        await expect(document.activeElement).toBe(container.querySelector('[data-testid="trigger"]'))
    })

    it('leaves Tab alone once the content has handled it itself', async () => {
        // Content is free to own the keystroke — a nested composite widget, or `StyledFilterMenu`
        // routing Shift+Tab back to its trigger. A handled Tab must not also be read as leaving.
        const Fixture = (): JSX.Element => {
            const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
            const [open, setOpen] = useState(false)
            return (
                <>
                    <button ref={setAnchorEl} type='button' data-testid='trigger' onClick={() => setOpen(true)}>
                        Open
                    </button>
                    <StyledPopover open={open} anchorEl={anchorEl} onClose={() => setOpen(false)}>
                        <button
                            type='button'
                            data-testid='own-tab'
                            onKeyDown={(event) => {
                                if (event.key === 'Tab') event.preventDefault()
                            }}
                        >
                            Handles Tab itself
                        </button>
                    </StyledPopover>
                    <button type='button' data-testid='after'>
                        After
                    </button>
                </>
            )
        }
        const { container } = mount(<Fixture />)
        await userEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!)
        const own = await waitFor(async () => {
            const button = document.querySelector<HTMLButtonElement>('[data-testid="own-tab"]')
            await expect(button).not.toBeNull()
            return button!
        })
        own.focus()

        await userEvent.tab()

        await expect(document.querySelector('[data-testid="own-tab"]')).not.toBeNull()
        await expect(document.activeElement).toBe(own)
    })

    describe('tabIntoContent', () => {
        const TabInFixture = ({ onClose }: { onClose?: () => void }): JSX.Element => {
            const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
            const [open, setOpen] = useState(false)
            const close = (): void => {
                onClose?.()
                setOpen(false)
            }
            return (
                <>
                    <button type='button' data-testid='before'>
                        Before
                    </button>
                    <button ref={setAnchorEl} type='button' data-testid='trigger' onClick={() => setOpen(true)}>
                        Open
                    </button>
                    <StyledPopover open={open} anchorEl={anchorEl} onClose={close}>
                        <button type='button' data-testid='inner-1'>
                            Inner 1
                        </button>
                        <button type='button' data-testid='inner-2'>
                            Inner 2
                        </button>
                    </StyledPopover>
                    <button type='button' data-testid='after'>
                        After
                    </button>
                </>
            )
        }
        const openPanel = async (container: HTMLElement): Promise<HTMLButtonElement> => {
            const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
            trigger.focus()
            await userEvent.keyboard('{Enter}')
            await waitFor(() => expect(document.querySelector('[data-testid="inner-1"]')).not.toBeNull())
            return trigger
        }

        it('walks trigger → panel → past the trigger, closing on the way out (2.1.1)', async () => {
            const { container } = mount(<TabInFixture />)
            await openPanel(container)

            await userEvent.tab()
            await expect(document.activeElement).toBe(document.querySelector('[data-testid="inner-1"]'))
            await userEvent.tab()
            await expect(document.activeElement).toBe(document.querySelector('[data-testid="inner-2"]'))
            await userEvent.tab()

            await waitFor(() => expect(document.querySelector('[data-testid="inner-1"]')).toBeNull())
            await expect(document.activeElement).toBe(container.querySelector('[data-testid="after"]'))
        })

        it('retraces to the trigger on Shift+Tab out of the first control (2.4.3)', async () => {
            const { container } = mount(<TabInFixture />)
            const trigger = await openPanel(container)
            await userEvent.tab()

            await userEvent.tab({ shift: true })

            await waitFor(() => expect(document.querySelector('[data-testid="inner-1"]')).toBeNull())
            // Not the control *before* the trigger: the panel was entered from here, so backwards
            // has to retrace the same step.
            await expect(document.activeElement).toBe(trigger)
        })

        it('reports the Tab-close transition only once', async () => {
            const onClose = fn()
            const { container } = mount(<TabInFixture onClose={onClose} />)
            await openPanel(container)

            await userEvent.tab()
            await userEvent.tab()
            await userEvent.tab()

            await waitFor(() => expect(document.querySelector('[data-testid="inner-1"]')).toBeNull())
            await expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('can leave a trigger-owned popover out of the sequence (2.1.2)', async () => {
            // The date and time pickers depend on this: their panel is a requested exception that
            // closes on Tab instead of taking focus.
            const TriggerOwnedFixture = (): JSX.Element => {
                const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <button ref={setAnchorEl} type='button' data-testid='trigger' onClick={() => setOpen(true)}>
                            Open popover
                        </button>
                        <StyledPopover
                            open={open}
                            anchorEl={anchorEl}
                            onClose={() => setOpen(false)}
                            tabIntoContent={false}
                        >
                            <button type='button' data-testid='popover-action'>
                                Popover action
                            </button>
                        </StyledPopover>
                        <button type='button' data-testid='after'>
                            After
                        </button>
                    </>
                )
            }
            const { container } = mount(<TriggerOwnedFixture />)
            const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
            trigger.focus()
            await userEvent.keyboard('{Enter}')
            await waitFor(() => expect(document.querySelector('[data-testid="popover-action"]')).not.toBeNull())

            await userEvent.tab()

            await expect(document.activeElement).toBe(container.querySelector('[data-testid="after"]'))
            await waitFor(() => expect(document.querySelector('[data-testid="popover-action"]')).toBeNull())
        })
    })

    it('keeps focus on the anchor when there is nothing past it to move to (2.4.3)', async () => {
        // A trigger can be the last control on the page — the date-picker story's nested range
        // picker is. Leaving the panel then has nowhere to go, and focus must not fall to <body>.
        const Fixture = (): JSX.Element => {
            const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
            const [open, setOpen] = useState(false)
            return (
                <>
                    <button ref={setAnchorEl} type='button' data-testid='trigger' onClick={() => setOpen(true)}>
                        Open
                    </button>
                    <StyledPopover open={open} anchorEl={anchorEl} onClose={() => setOpen(false)} tabIntoContent>
                        <button type='button' data-testid='only'>
                            Only
                        </button>
                    </StyledPopover>
                </>
            )
        }
        const { container } = mount(<Fixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
        trigger.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(document.querySelector('[data-testid="only"]')).not.toBeNull())
        await userEvent.tab()
        await expect(document.activeElement).toBe(document.querySelector('[data-testid="only"]'))

        await userEvent.tab()

        await waitFor(() => expect(document.querySelector('[data-testid="only"]')).toBeNull())
        await expect(document.activeElement).toBe(trigger)
    })
})
