import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it } from 'vitest'

import type { DynamicToolbarAction } from '../../../custom/module/header-layout/planToolbarActions'
import { StyledDialogFooter } from './StyledDialogFooter'

/* SSR in the Node test env: stub the browser globals StyledPopover probes. */
beforeAll(() => {
    Object.assign(globalThis, { Element: class {}, HTMLDialogElement: class {} })
})

const noop = () => undefined

const deleteAction: DynamicToolbarAction = {
    id: 'delete',
    label: 'Delete event',
    icon: <span aria-hidden>D</span>,
    onClick: noop,
    tone: 'danger',
}

describe('StyledDialogFooter (ASMA-7099)', () => {
    it('renders Cancel and the primary action, in that order', () => {
        const html = renderToStaticMarkup(
            <StyledDialogFooter
                secondaryAction={{ label: 'Cancel', onClick: noop }}
                primaryAction={{ label: 'Save changes', type: 'submit' }}
            />,
        )

        expect(html).toContain('Cancel')
        expect(html).toContain('Save changes')
        expect(html.indexOf('Cancel')).toBeLessThan(html.indexOf('Save changes'))
    })

    it('lets the primary action submit a surrounding form', () => {
        const html = renderToStaticMarkup(
            <StyledDialogFooter primaryAction={{ label: 'Save changes', type: 'submit' }} />,
        )

        expect(html).toContain('type="submit"')
    })

    it('defaults both right-cluster buttons to type="button" so neither submits by accident', () => {
        const html = renderToStaticMarkup(
            <StyledDialogFooter
                secondaryAction={{ label: 'Cancel', onClick: noop }}
                primaryAction={{ label: 'Add new', onClick: noop }}
            />,
        )

        expect(html).not.toContain('type="submit"')
        expect(html.split('type="button"').length - 1).toBe(2)
    })

    it('never drops a left action: with no measured width it retreats into the More menu', () => {
        /* SSR measures nothing, so the planner has 0px to work with — the invariant under
         * test is that the action survives as an overflow item rather than disappearing.
         * The item's own label lives in the closed menu and is asserted in the Storybook
         * interaction test, which can actually open it. */
        const html = renderToStaticMarkup(
            <StyledDialogFooter
                leftActions={[deleteAction]}
                secondaryAction={{ label: 'Cancel', onClick: noop }}
                primaryAction={{ label: 'Save changes', onClick: noop }}
            />,
        )

        expect(html).toContain('styled-dialog-footer-more')
        /* The right cluster never overflows — the primary action must stay reachable. */
        expect(html).toContain('Save changes')
        expect(html).toContain('Cancel')
    })

    it('keeps left-cluster actions out of the surrounding form submit', () => {
        /* A footer normally lives inside a <form>, where a bare <button> defaults to
         * type="submit" — a left action must run its own handler, not submit the form. */
        const html = renderToStaticMarkup(
            <StyledDialogFooter
                leftActions={[{ ...deleteAction, id: 'archive', label: 'Archive', canOverflow: false, keepVisible: true }]}
            />,
        )

        expect(html).toContain('type="button"')
        expect(html).not.toContain('type="submit"')
    })

    it('never collapses an icon-less action into a blank button', () => {
        /* Collapsing the label of an action with no icon leaves an empty box on screen, so such
         * an action must keep its label (and overflow instead) rather than render as nothing. */
        const html = renderToStaticMarkup(
            <StyledDialogFooter
                leftActions={[{ id: 'standard', label: 'Use as standard', onClick: noop, keepVisible: true, canOverflow: false }]}
            />,
        )

        expect(html).toContain('Use as standard')
    })

    it('still honours an explicit canHideLabel on an icon-less action', () => {
        const html = renderToStaticMarkup(
            <StyledDialogFooter
                leftActions={[
                    {
                        id: 'standard',
                        label: 'Use as standard',
                        onClick: noop,
                        canHideLabel: true,
                        keepVisible: true,
                        canOverflow: false,
                    },
                ]}
            />,
        )

        /* Collapsed: the label is gone from the button body but survives as the accessible name. */
        expect(html).toContain('aria-label="Use as standard"')
        expect(html).not.toContain('>Use as standard<')
    })

    it('shows a spinner and disables the button while loading, keeping the label', () => {
        /* The footers this replaces swapped the label FOR a spinner, which changed the
         * button width mid-submit and forced hard-coded `w-[98px]` workarounds. */
        const html = renderToStaticMarkup(
            <StyledDialogFooter primaryAction={{ label: 'Save filter', loading: true }} />,
        )

        expect(html).toContain('Save filter')
        expect(html).toContain('disabled')
        expect(html).toContain('aria-busy="true"')
    })

    it('renders an endIcon on a right-cluster button', () => {
        const html = renderToStaticMarkup(
            <StyledDialogFooter primaryAction={{ label: 'Save', endIcon: <span>END</span> }} />,
        )

        expect(html).toContain('END')
    })

    it('anchors a tooltip on a wrapper only when one is supplied', () => {
        /* StyledTooltip renders its content lazily on hover, so the title is absent from
         * static markup — what SSR can prove is that the anchor wrapper exists at all, and
         * that a falsy tooltip adds no stray wrapper. The visible text is asserted by the
         * Storybook interaction test, which can actually hover. */
        const withTooltip = renderToStaticMarkup(
            <StyledDialogFooter primaryAction={{ label: 'Save', disabled: true, tooltip: 'Locked for editing' }} />,
        )
        const without = renderToStaticMarkup(<StyledDialogFooter primaryAction={{ label: 'Save' }} />)

        expect(withTooltip).toContain('<span class="inline-flex">')
        expect(without).not.toContain('<span class="inline-flex">')
    })

    it('omits hidden left actions entirely', () => {
        const html = renderToStaticMarkup(
            <StyledDialogFooter leftActions={[{ ...deleteAction, hidden: true }]} />,
        )

        expect(html).not.toContain('Delete event')
        expect(html).not.toContain('styled-dialog-footer-more')
    })

    it('gives the More trigger an accessible name and a menu popup contract', () => {
        const html = renderToStaticMarkup(<StyledDialogFooter leftActions={[deleteAction]} />)

        expect(html).toContain('aria-label="More"')
        expect(html).toContain('aria-haspopup="menu"')
        expect(html).toContain('aria-expanded="false"')
    })

    it('translates the More trigger', () => {
        const html = renderToStaticMarkup(<StyledDialogFooter leftActions={[deleteAction]} locale='no' />)

        expect(html).toContain('aria-label="Mer"')
    })

    it('replaces the planned left cluster with leadingSlot', () => {
        const html = renderToStaticMarkup(
            <StyledDialogFooter leftActions={[deleteAction]} leadingSlot={<span>Notify participants</span>} />,
        )

        expect(html).toContain('Notify participants')
        expect(html).not.toContain('styled-dialog-footer-more')
    })

    it('applies the DS "Fixed bottom" shadow only when fixed', () => {
        const fixedHtml = renderToStaticMarkup(<StyledDialogFooter fixed />)
        const staticHtml = renderToStaticMarkup(<StyledDialogFooter />)

        expect(fixedHtml).toContain('shadow-[0_0_16px_0_rgba(34,33,51,0.2)]')
        expect(fixedHtml).toContain('sticky')
        expect(staticHtml).not.toContain('shadow-[0_0_16px_0_rgba(34,33,51,0.2)]')
    })

    it('rounds the bottom corners by default and squares them on request', () => {
        expect(renderToStaticMarkup(<StyledDialogFooter />)).toContain('rounded-b-lg')
        expect(renderToStaticMarkup(<StyledDialogFooter rounded={false} />)).not.toContain('rounded-b-lg')
    })

    it('keeps the separator border and surface from the Figma spec', () => {
        const html = renderToStaticMarkup(<StyledDialogFooter />)

        expect(html).toContain('border-t')
        expect(html).toContain('border-delta-200')
        expect(html).toContain('bg-white')
    })

    it('renders no right cluster when neither action is supplied', () => {
        const html = renderToStaticMarkup(<StyledDialogFooter leadingSlot={<span>Info</span>} />)

        expect(html).not.toContain('styled-dialog-footer-secondary')
        expect(html).not.toContain('styled-dialog-footer-primary')
    })
})
