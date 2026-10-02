import { forwardRef, type PropsWithChildren } from 'react'
import { cn } from 'src/helpers/cn'
import style from './StyledWidgetTitle.module.scss'

type StyledWidgetTitleProps = PropsWithChildren<{
    className?: string
    component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}>

/**
 * @figmaNode none — DS **Section title** typography (Roboto SemiBold 18/28, `delta-800`). Widget/
 * widget-header heading; theme-safe via the delta token layer.
 */
export const StyledWidgetTitle = forwardRef<HTMLHeadingElement, StyledWidgetTitleProps>(
    function StyledWidgetTitle(props, ref) {
        const Component = props.component ?? 'h2'

        return (
            <Component ref={ref} className={cn(style['styled-widget-title'], props.className)}>
                {props.children}
            </Component>
        )
    },
)
