import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { StyledWidget } from './StyledWidget'

const base = {
    title: 'Chats',
    isLoading: false,
    isEmpty: false,
    emptyText: 'No chats',
    link: { content: 'Go to chats', onClick: () => undefined },
}

describe('StyledWidget footer (ASMA-8699)', () => {
    it('replaces a disabled View more with read-only helper text and keeps the go-to link', () => {
        const html = renderToStaticMarkup(
            <StyledWidget
                {...base}
                viewMore={{
                    viewMoreText: 'View more',
                    viewLessText: 'View less',
                    disabled: true,
                    disabledReason: 'All items are shown',
                }}
            >
                <span>row</span>
            </StyledWidget>,
        )

        expect(html).toContain('data-testid="all-items-shown"')
        expect(html).toContain('All items are shown')
        expect(html).toContain('Go to chats')
        expect(html).toContain('data-testid="go-to-button"')
        expect(html).not.toContain('data-testid="view-more"')
        expect(html).not.toContain('>View more<')
        expect(html).toContain('<p class="_widget-all-shown')
    })

    it('keeps View more as a button when more items can be shown', () => {
        const html = renderToStaticMarkup(
            <StyledWidget
                {...base}
                viewMore={{
                    viewMoreText: 'View more',
                    viewLessText: 'View less',
                }}
            >
                <span>row</span>
            </StyledWidget>,
        )

        expect(html).toContain('data-testid="view-more"')
        expect(html).toContain('View more')
        expect(html).not.toContain('data-testid="all-items-shown"')
    })
})
