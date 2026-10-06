import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StyledDynamicSelect } from './StyledDynamicSelect'

/**
 * Read-only rule: a **single** select shows its selected label as plain text — no chip, no input,
 * no helper/error row — whatever the option count. A **multiple** select is out of scope and keeps
 * its read-only chips.
 */

const FEW = ['After', 'Before', 'Same day']
const MANY = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf']

const noop = (): void => undefined

const readOnlyValue = (html: string): string | undefined =>
    /data-testid="ro-read-only-value"[^>]*>(.*?)<\/div>/.exec(html)?.[1]

describe('StyledDynamicSelect — read-only single select', () => {
    it('renders the selected label as plain text with ≤5 options — no chip', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect dataTest='ro' options={FEW} value='After' onChange={noop} readOnly />,
        )

        expect(readOnlyValue(html)).toBe('After')
        expect(html).not.toContain('data-testid="ic-After"')
        expect(html).not.toContain('MuiChip')
        expect(html).not.toContain('<input')
    })

    it('renders the selected label as plain text with 6+ options — no input field', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect dataTest='ro' options={MANY} value='Echo' onChange={noop} readOnly />,
        )

        expect(readOnlyValue(html)).toBe('Echo')
        expect(html).not.toContain('<input')
        expect(html).not.toContain('MuiChip')
    })

    it('shows "-" when nothing is selected, at either option count', () => {
        for (const options of [FEW, MANY]) {
            const html = renderToStaticMarkup(
                <StyledDynamicSelect dataTest='ro' options={options} value={null} onChange={noop} readOnly />,
            )
            expect(readOnlyValue(html)).toBe('-')
        }
    })

    it('keeps the title above the value', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect
                dataTest='ro'
                title='Send module'
                options={FEW}
                value='After'
                onChange={noop}
                readOnly
            />,
        )

        expect(html).toContain('Send module')
        expect(html.indexOf('Send module')).toBeLessThan(html.indexOf('data-testid="ro-read-only-value"'))
    })

    it('drops the helper and error row', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect
                dataTest='ro'
                options={FEW}
                value='After'
                onChange={noop}
                readOnly
                error
                helperText='Pick one'
            />,
        )

        expect(html).not.toContain('Pick one')
        expect(html).not.toContain('role="alert"')
    })

    it('has no clear-selection button', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect dataTest='ro' options={FEW} value='After' onChange={noop} readOnly />,
        )

        expect(html).not.toContain('clear-selection-btn')
    })

    it('resolves the label from the matching option, honouring valueKey and labelKey', () => {
        interface Rule {
            id: string
            name: string
        }
        const rules: Rule[] = [
            { id: 'now', name: 'Send immediately' },
            { id: 'skip', name: 'Skip' },
        ]

        const html = renderToStaticMarkup(
            <StyledDynamicSelect<Rule>
                dataTest='ro'
                options={rules}
                // Only the identity on the value — the label comes from the option.
                value={{ id: 'now', name: '' }}
                onChange={noop}
                valueKey='id'
                labelKey='name'
                readOnly
            />,
        )

        expect(readOnlyValue(html)).toBe('Send immediately')
    })

    it('uses renderLabel when given', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect
                dataTest='ro'
                options={FEW}
                value='After'
                onChange={noop}
                renderLabel={(option) => <b>{`${option}!`}</b>}
                readOnly
            />,
        )

        expect(readOnlyValue(html)).toBe('<b>After!</b>')
    })

    it.each(['medium', 'small'] as const)('uses Body Base 16/24 in text-icon/body at size %s', (size) => {
        // `size` scales chips and buttons; read-only draws neither, so the text never shrinks.
        const html = renderToStaticMarkup(
            <StyledDynamicSelect dataTest='ro' options={FEW} value='After' onChange={noop} size={size} readOnly />,
        )
        const valueClass = /data-testid="ro-read-only-value" class="([^"]*)"/.exec(html)?.[1] ?? ''

        expect(valueClass.split(' ')).toEqual(expect.arrayContaining(['text-base/6', 'text-delta-700']))
        expect(valueClass).not.toContain('text-sm')
    })
})

describe('StyledDynamicSelect — rule does not apply', () => {
    it('leaves an editable single select as chips', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect dataTest='ro' options={FEW} value='After' onChange={noop} />,
        )

        expect(html).not.toContain('ro-read-only')
        expect(html).toContain('data-testid="ic-After"')
    })

    it('leaves an editable single select with 6+ options as an input', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect dataTest='ro' options={MANY} value='Echo' onChange={noop} />,
        )

        expect(html).not.toContain('ro-read-only')
        expect(html).toContain('<input')
    })

    it('keeps read-only multiple select as chips with ≤5 options', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect
                dataTest='ro'
                options={FEW}
                value={['After', 'Before']}
                onChange={noop}
                multiple
                readOnly
            />,
        )

        expect(html).not.toContain('ro-read-only')
        expect(html).toContain('data-testid="ic-After"')
        expect(html).toContain('data-testid="ic-Before"')
    })

    it('keeps read-only multiple select as chips with 6+ options', () => {
        const html = renderToStaticMarkup(
            <StyledDynamicSelect
                dataTest='ro'
                options={MANY}
                value={['Alpha', 'Golf']}
                onChange={noop}
                multiple
                readOnly
            />,
        )

        expect(html).not.toContain('ro-read-only')
        expect(html).toContain('data-testid="ic-Alpha"')
        expect(html).toContain('data-testid="ic-Golf"')
    })
})
