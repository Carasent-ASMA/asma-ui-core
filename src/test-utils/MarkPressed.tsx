import { useLayoutEffect, useRef, type ReactNode } from 'react'

/**
 * Story-only (ASMA-9003): gives the elements inside that match `selector` the attribute a real press sets
 * (`data-pressed`), so a gallery can show the momentary pressed look statically. `display: contents`, so the
 * wrapper does not change the layout it sits in.
 */
export const MarkPressed = ({ selector, children }: { selector: string; children: ReactNode }): JSX.Element => {
    const ref = useRef<HTMLSpanElement>(null)
    useLayoutEffect(() => {
        ref.current?.querySelectorAll(selector).forEach((element) => element.setAttribute('data-pressed', ''))
    })
    return (
        <span ref={ref} className='contents'>
            {children}
        </span>
    )
}
