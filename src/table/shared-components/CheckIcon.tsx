import type { SVGProps } from 'react'
import { CheckIcon as CoreCheckIcon } from 'src/components/icons/check-icon'

/**
 * The core `CheckIcon` (identical artwork and viewBox) wrapped only to preserve the table copy's
 * historical `1rem` default size — the core default is 24px, and table call sites override `width`
 * but not `height`, so a plain re-export would change the rendered glyph. ASMA-8134.
 *
 * The core icon also carries `aria-hidden='true'`, which the table copy was missing: these glyphs
 * are decorative cell adornments, so hiding them from the a11y tree is the intended behaviour.
 */
export function CheckIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
    return <CoreCheckIcon width='1rem' height='1rem' {...props} />
}
