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

/**
 * Review-desk F2: the padding has to follow the header, not only the layout. In the inline toolbar the
 * 40px controls are centred in the summary row, so the summary leaves (height - 40) / 2 under them:
 * 72px -> 16, 48px -> 4. Helper text is a further row below the controls (4px gap + a 20px line).
 *
 * Every supported variant is mounted with the real `DynamicToolbar` and measured. The target is 16px
 * from the lowest control to the table. Two cases measure something else, on purpose, and say so:
 *
 * - helper text (inline; in the other layouts it is above the controls, which stay last): the controls are no longer the last thing in the header and the helper row sits
 *   between them and the table, so 16px under the controls is unreachable (a negative margin would put the
 *   table over the helper text). The table is 16px under the helper text instead.
 * - stacked: the toolbar's own row is 44.4px tall with after-search actions (the actions wrapper) and the
 *   search/filter sit 2.2px above its bottom, before any content padding. That is DynamicToolbar's
 *   alignment, not the content's: the content adds exactly 16.
 */

type Layout = 'inline' | 'compact' | 'stacked' | 'selection-split'

interface Variant {
    name: string
    size: 'large' | 'small'
    helper: boolean
    layout: Layout
    /** Container width that makes the toolbar plan `layout`. */
    width: number
    /** Padding-top the content must have with `toolbarHeader`. */
    paddingTop: string
}

const actions = (count: number): { id: string; label: string; onClick: () => void; priority: number }[] =>
    Array.from({ length: count }, (_, index) => ({
        id: `a${index}`,
        label: `Action number ${index}`,
        onClick: () => undefined,
        priority: 50,
    }))

const VARIANTS: Variant[] = [
    { name: 'large inline', size: 'large', helper: false, layout: 'inline', width: 1000, paddingTop: '0px' },
    { name: 'small inline', size: 'small', helper: false, layout: 'inline', width: 1000, paddingTop: '12px' },
    { name: 'large inline + helper', size: 'large', helper: true, layout: 'inline', width: 1000, paddingTop: '16px' },
    { name: 'small inline + helper', size: 'small', helper: true, layout: 'inline', width: 1000, paddingTop: '16px' },
    { name: 'large compact', size: 'large', helper: false, layout: 'compact', width: 500, paddingTop: '16px' },
    { name: 'small compact', size: 'small', helper: false, layout: 'compact', width: 500, paddingTop: '16px' },
    { name: 'large compact + helper', size: 'large', helper: true, layout: 'compact', width: 500, paddingTop: '16px' },
    { name: 'large stacked', size: 'large', helper: false, layout: 'stacked', width: 760, paddingTop: '16px' },
    { name: 'small stacked', size: 'small', helper: false, layout: 'stacked', width: 760, paddingTop: '16px' },
    {
        name: 'large selection-split',
        size: 'large',
        helper: false,
        layout: 'selection-split',
        width: 760,
        paddingTop: '16px',
    },
    {
        name: 'small selection-split',
        size: 'small',
        helper: false,
        layout: 'selection-split',
        width: 760,
        paddingTop: '16px',
    },
]

const variantAccordion = (variant: Variant, toolbarHeader: boolean): ReactElement => (
    <div style={{ width: variant.width }}>
        <StyledAccordion defaultExpanded>
            <DynamicToolbar
                dataTest='toolbar'
                className='px-4'
                helperText={variant.helper ? 'Helper text' : undefined}
                selectedCount={variant.layout === 'selection-split' ? 3 : 0}
                onClearSelection={() => undefined}
                bulkActions={variant.layout === 'selection-split' ? actions(4) : []}
                afterSearchActions={variant.layout === 'stacked' ? actions(6) : []}
                title={
                    <StyledAccordionSummary
                        size={variant.size}
                        sx={{ '--trigger-padding-x': '0px' } as React.CSSProperties}
                    >
                        Consents
                    </StyledAccordionSummary>
                }
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
            <StyledAccordionDetails className='flex flex-col' toolbarHeader={toolbarHeader} data-testid='details'>
                {tableOf()}
            </StyledAccordionDetails>
        </StyledAccordion>
    </div>
)

const mountVariant = async (variant: Variant, toolbarHeader: boolean): Promise<void> => {
    mount(variantAccordion(variant, toolbarHeader))
    await waitFor(() => expect(q('[data-testid="toolbar"]')).toHaveAttribute('data-layout', variant.layout))
    await new Promise((resolve) => setTimeout(resolve, 200))
    await waitFor(() => expect(q('[data-testid="toolbar"]')).toHaveAttribute('data-layout', variant.layout))
}

/** The lowest real control of the toolbar (not the hidden measuring strip, which sits above the viewport). */
const controlsBottom = (): number =>
    Math.max(
        ...[
            ...document.querySelectorAll<HTMLElement>(
                '[data-testid="toolbar"] button:not([aria-expanded]), [data-testid="search"]',
            ),
        ].map((control) => control.getBoundingClientRect().bottom),
    )

const tableTop = (): number => q('table').getBoundingClientRect().top

const helperBottom = (): number =>
    [...document.querySelectorAll<HTMLElement>('[data-testid="toolbar"] div')]
        .find((el) => el.textContent === 'Helper text' && el.children.length === 0)!
        .getBoundingClientRect().bottom

describe('StyledAccordionDetails toolbarHeader by header variant (ASMA-8600 F2)', () => {
    afterEach(cleanup)

    it.each(VARIANTS)('$name: content padding-top $paddingTop and the table 16px below', async (variant) => {
        await mountVariant(variant, true)

        await expect(getComputedStyle(content()).paddingTop).toBe(variant.paddingTop)

        if (variant.helper && variant.layout === 'inline') {
            // The helper row is between the controls and the table: 16px under the helper text.
            await expect(Math.abs(tableTop() - helperBottom() - TARGET_GAP)).toBeLessThanOrEqual(1)
            await expect(tableTop() - controlsBottom()).toBeGreaterThan(TARGET_GAP)
        } else if (variant.layout === 'stacked') {
            // 16 from the content, plus the 2.2px the toolbar's own row leaves under the search and filter.
            await expect(tableTop() - controlsBottom()).toBeGreaterThanOrEqual(TARGET_GAP)
            await expect(tableTop() - controlsBottom()).toBeLessThanOrEqual(TARGET_GAP + 3)
        } else {
            await expect(Math.abs(tableTop() - controlsBottom() - TARGET_GAP)).toBeLessThanOrEqual(1)
        }
    })

    it.each(VARIANTS)('$name: without the prop the padding is the old 8px 16px 16px', async (variant) => {
        await mountVariant(variant, false)

        await expect(padding(content())).toBe('8px 16px 16px 16px')
    })
})
