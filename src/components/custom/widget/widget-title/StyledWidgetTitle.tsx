import { forwardRef, type PropsWithChildren } from 'react'
import { cn } from 'src/helpers/cn'
import style from './StyledWidgetTitle.module.scss'

export const StyledWidgetTitle = forwardRef<HTMLDivElement, PropsWithChildren<{ className?: string }>>(
    function StyledWidgetTitle(props, ref) {
        return (
            <div ref={ref} className={cn(style['styled-widget-title'], props.className)}>
                {props.children}
            </div>
        )
    },
)
