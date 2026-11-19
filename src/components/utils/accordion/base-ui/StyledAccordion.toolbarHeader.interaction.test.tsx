import type { ReactElement } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { people, personColumns, type Person } from 'src/test-utils/tableFixture'
import { DynamicToolbar } from 'src/components/custom/module/header-layout/DynamicToolbar'
import { StyledSearchField } from 'src/components/inputs/search-field'
import { StyledFilterButton } from 'src/components/utils/filter-menu/StyledFilterButton'
import { StyledTable } from 'src/table/components/StyledTableIndex'
import { StyledAccordion } from './StyledAccordion'
import { StyledAccordionDetails } from './StyledAccordionDetails'
import { StyledAccordionSummary } from './StyledAccordionSummary'

/**
 * ASMA-8600: an accordion whose header holds a `DynamicToolbar` (filter + search) directly above a
 * table has 16 px between the toolbar controls and the table, not the 24 px the default content
 * padding gave. `StyledAccordionDetails toolbarHeader` is the opt-in; the default is untouched.
 *
 * Asserted in a real browser on the real components: the gap is a measurement
 * (`table.top - controls.bottom`), not a class name. The toolbar plans its layout from its own
 * width (inline from 744 px, compact below), so the two widths below are the two cases:
 *
 * - inline: the 72 px summary row already leaves 16 px under the 40 px controls -> content padding-top 0;
 * - compact: the controls are the toolbar's last row, so the 16 px must come from the content -> 16.
 */

const WIDE = 1000
const NARROW = 500
const TARGET_GAP = 16

const toolbar = (): ReactElement => (
    <DynamicToolbar
        dataTest='toolbar'
        title={
            <StyledAccordionSummary sx={{ '--trigger-padding-x': '0px' } as React.CSSProperties}>
                Consents
            </StyledAccordionSummary>
        }
        className='px-4'
        filter={<StyledFilterButton dataTest='filter' filterIsActive={false} size='medium' label='Filter' />}
        search={
            <StyledSearchField
                dataTest='search'
                label='Search'
                value=''
                onChange={() => undefined}
                onClear={() => undefined}
            />
        }
    />
)

const tableOf = (): ReactElement => <StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' />

const accordion = (width: number, toolbarHeader: boolean | undefined, extra?: ReactElement): ReactElement => (
    <div style={{ width }}>
        <StyledAccordion defaultExpanded>
            {toolbar()}
            <StyledAccordionDetails className='flex flex-col' toolbarHeader={toolbarHeader} data-testid='details'>
                {tableOf()}
                {extra}
            </StyledAccordionDetails>
        </StyledAccordion>
    </div>
)

const q = (selector: string, scope: ParentNode = document): HTMLElement => scope.querySelector<HTMLElement>(selector)!
const content = (): HTMLElement => q('[data-testid="details"] > div')
const padding = (el: HTMLElement): string => {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getComputedStyle(el)

    return [paddingTop, paddingRight, paddingBottom, paddingLeft].join(' ')
}

/** Mounts and waits until the toolbar has planned the layout (it starts `inline` before it has measured). */
const mountAccordion = async (
    width: number,
    toolbarHeader: boolean | undefined,
    extra?: ReactElement,
): Promise<string> => {
    mount(accordion(width, toolbarHeader, extra))
    const expected = width >= 744 ? 'inline' : 'compact'

    await waitFor(() => expect(q('[data-testid="toolbar"]')).toHaveAttribute('data-layout', expected))
    // The layout is settled when two frames in a row agree: the toolbar re-plans from measured widths.
    await new Promise((resolve) => setTimeout(resolve, 150))
    await waitFor(() => expect(q('[data-testid="toolbar"]')).toHaveAttribute('data-layout', expected))

    return expected
}

/** Table top minus the lowest toolbar control's bottom: what the user sees between the controls and the table. */
const gap = (): number => {
    const controls = [q('[data-testid="filter"]'), q('[data-testid="search"]')]
    const bottom = Math.max(...controls.map((control) => control.getBoundingClientRect().bottom))

    return q('table').getBoundingClientRect().top - bottom
}

describe('StyledAccordionDetails toolbarHeader (ASMA-8600)', () => {
    afterEach(cleanup)

    it('has 16px from the controls to the table in the inline toolbar, with no content padding on top', async () => {
        await mountAccordion(WIDE, true)

        await expect(padding(content())).toBe('0px 16px 16px 16px')
        await expect(Math.abs(gap() - TARGET_GAP)).toBeLessThanOrEqual(1)
    })

    it('has 16px from the controls to the table in the compact toolbar, all of it from the content', async () => {
        await mountAccordion(NARROW, true)

        await expect(padding(content())).toBe('16px 16px 16px 16px')
        await expect(Math.abs(gap() - TARGET_GAP)).toBeLessThanOrEqual(1)
    })

    it('marks the content element and nothing else', async () => {
        await mountAccordion(WIDE, true)

        await expect(content()).toHaveAttribute('data-toolbar-header', '')
        await expect(document.querySelectorAll('[data-toolbar-header]')).toHaveLength(1)
    })

    it('without the prop keeps the old padding at both widths (24px gap in compact)', async () => {
        await mountAccordion(WIDE, undefined)
        await expect(content()).not.toHaveAttribute('data-toolbar-header')
        await expect(padding(content())).toBe('8px 16px 16px 16px')
        const wide = gap()

        cleanup()
        await mountAccordion(NARROW, false)
        await expect(content()).not.toHaveAttribute('data-toolbar-header')
        await expect(padding(content())).toBe('8px 16px 16px 16px')
        // 8px content padding on the 8px stack gap; wide is 16 + 8.
        await expect(Math.abs(gap() - 8)).toBeLessThanOrEqual(1)
        await expect(Math.abs(wide - 24)).toBeLessThanOrEqual(1)
    })

    it('follows the toolbar when it re-plans: narrowing the container flips inline 0 to compact 16', async () => {
        await mountAccordion(WIDE, true)
        await expect(padding(content())).toBe('0px 16px 16px 16px')

        const host = q('[data-testid="toolbar"]').closest<HTMLElement>('div[style*="width"]')!

        host.style.width = `${NARROW}px`
        await waitFor(() => expect(q('[data-testid="toolbar"]')).toHaveAttribute('data-layout', 'compact'))
        await expect(padding(content())).toBe('16px 16px 16px 16px')
    })

    it('lets a consumer override the padding with an important class on contentClassName', async () => {
        const host = document.createElement('style')

        host.textContent = '.consumer-pt { padding-top: 40px !important }'
        document.head.appendChild(host)
        mount(
            <div style={{ width: NARROW }}>
                <StyledAccordion defaultExpanded>
                    {toolbar()}
                    <StyledAccordionDetails toolbarHeader contentClassName='consumer-pt' data-testid='details'>
                        {tableOf()}
                    </StyledAccordionDetails>
                </StyledAccordion>
            </div>,
        )

        await expect(getComputedStyle(content()).paddingTop).toBe('40px')
        host.remove()
    })

    it('does not let a nested accordion change the parent: each content follows its own header', async () => {
        // Outer: inline toolbar (wide) with toolbarHeader. Inner (in the outer's content): a plain-header
        // accordion with its own toolbarHeader content, which has no toolbar, so it must stay at 16.
        const nested = (
            <StyledAccordion defaultExpanded data-testid='inner'>
                <StyledAccordionSummary>Inner</StyledAccordionSummary>
                <StyledAccordionDetails toolbarHeader data-testid='inner-details'>
                    <p>inner body</p>
                </StyledAccordionDetails>
            </StyledAccordion>
        )

        await mountAccordion(WIDE, true, nested)

        await expect(padding(content())).toBe('0px 16px 16px 16px')
        await expect(getComputedStyle(q('[data-testid="inner-details"] > div')).paddingTop).toBe('16px')
    })

    it('does not let a nested inline toolbar flip a parent whose own header is not inline', async () => {
        // Outer: compact toolbar (narrow). Inner accordion in its content holds an inline toolbar (a
        // wider container inside); the outer must stay at 16 and the inner follows its own header.
        const inner = (
            <div style={{ width: 800 }}>
                <StyledAccordion defaultExpanded data-testid='inner'>
                    <DynamicToolbar dataTest='inner-toolbar' title='Inner' className='px-4' />
                    <StyledAccordionDetails toolbarHeader data-testid='inner-details'>
                        <p>inner body</p>
                    </StyledAccordionDetails>
                </StyledAccordion>
            </div>
        )

        await mountAccordion(NARROW, true, inner)
        await waitFor(() => expect(q('[data-testid="inner-toolbar"]')).toHaveAttribute('data-layout', 'inline'))

        await expect(padding(content())).toBe('16px 16px 16px 16px')
        await expect(getComputedStyle(q('[data-testid="inner-details"] > div')).paddingTop).toBe('0px')
    })
})

describe('StyledAccordionDetails toolbarHeader by layout value (ASMA-8600)', () => {
    afterEach(cleanup)

    // Every `data-layout` DynamicToolbar can emit (DynamicToolbar.tsx: toolbarShell). Only `inline` is 0.
    // A fixture element stands in for the toolbar so each value is asserted without depending on the
    // toolbar's width planning.
    const cases: [string, string][] = [
        ['inline', '0px'],
        ['compact', '16px'],
        ['stacked', '16px'],
        ['selection-split', '16px'],
    ]

    it.each(cases)('data-layout="%s" gives padding-top %s', async (layout, expected) => {
        mount(
            <StyledAccordion defaultExpanded>
                <div data-layout={layout} data-testid='fixture-toolbar'>
                    <StyledAccordionSummary>Title</StyledAccordionSummary>
                </div>
                <StyledAccordionDetails toolbarHeader data-testid='details'>
                    <p>body</p>
                </StyledAccordionDetails>
            </StyledAccordion>,
        )

        await expect(getComputedStyle(content()).paddingTop).toBe(expected)
    })

    it('with a 40px control stub row the gap is 16 in every layout', async () => {
        for (const [layout] of cases) {
            mount(
                <StyledAccordion defaultExpanded>
                    <div data-layout={layout} data-testid='fixture-toolbar' className='flex flex-col'>
                        {/* inline: the 72px summary row; others: title row, then the controls last */}
                        <div style={{ height: layout === 'inline' ? 72 : 0, display: 'flex', alignItems: 'center' }}>
                            <div data-testid='stub' style={{ height: 40, width: 100 }} />
                        </div>
                        {layout !== 'inline' && <div data-testid='stub' style={{ height: 40, width: 100 }} />}
                    </div>
                    <StyledAccordionDetails toolbarHeader data-testid='details'>
                        <div data-testid='below' style={{ height: 20 }} />
                    </StyledAccordionDetails>
                </StyledAccordion>,
            )
            const stubs = [...document.querySelectorAll<HTMLElement>('[data-testid="stub"]')]
            const bottom = Math.max(...stubs.map((stub) => stub.getBoundingClientRect().bottom))
            const top = q('[data-testid="below"]').getBoundingClientRect().top

            await expect(Math.abs(top - bottom - 16), layout).toBeLessThanOrEqual(1)
            cleanup()
        }
    })
})
