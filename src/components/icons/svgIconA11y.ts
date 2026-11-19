import type { SVGProps } from 'react'

export type SvgIconProps = SVGProps<SVGSVGElement> & {
    /** Accessible name, rendered as the SVG `<title>`. Without it (or `aria-label`) the icon is decorative. */
    title?: string
}

/**
 * ASMA-8963 (WCAG 1.1.1 / 2.5.3): an unnamed icon is hidden from assistive tech, so it adds nothing to the name of
 * the link or button it sits in. Spread before the caller's props so an explicit `role`/`aria-hidden` still wins.
 */
export const getSvgIconA11yProps = (
    title: string | undefined,
    props: SVGProps<SVGSVGElement>,
): SVGProps<SVGSVGElement> =>
    title || props['aria-label'] || props['aria-labelledby']
        ? { role: 'img' }
        : { 'aria-hidden': 'true', focusable: 'false' }
