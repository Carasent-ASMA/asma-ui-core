import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { StyledMenuItem as NavigationStyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { StyledMenuItem as TableStyledMenuItem } from 'src/table/shared-components/StyledMenuItem'

// All ui-core utilities are compiled with `important: true`, so a plain (or `!`-prefixed)
// `text-delta-300` loses to the later `text-delta-700` / consumer colour classes by stylesheet
// order. Only the `aria-disabled:` variant (class + attribute selector, specificity 0,2,0)
// reliably applies the Figma disabled grey. This pins that class against regression.
describe.each([
    ['table shared-components', TableStyledMenuItem],
    ['navigation menu', NavigationStyledMenuItem],
])('StyledMenuItem (%s) — disabled text colour', (_variant, StyledMenuItem) => {
    it('marks the item aria-disabled and applies the aria-disabled grey utility', () => {
        const html = renderToStaticMarkup(<StyledMenuItem disabled>Label</StyledMenuItem>)

        expect(html).toContain('aria-disabled="true"')
        expect(html).toContain('aria-disabled:text-delta-300')
    })

    it('keeps the enabled item on the body colour without the disabled grey', () => {
        const html = renderToStaticMarkup(<StyledMenuItem>Label</StyledMenuItem>)

        expect(html).not.toContain('aria-disabled')
        expect(html).toContain('text-delta-700')
    })
})
