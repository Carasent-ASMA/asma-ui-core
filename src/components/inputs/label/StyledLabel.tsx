import type { CSSProperties, FC, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import style from './StyledLabel.module.scss'
import clsx from 'clsx'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15181-43701 (Design-System · "Label / Highlighting")
 *
 * Small uppercase highlighting/status pill: h16, px6, radius 3, X-small Semibold uppercase
 * (11/12, ls 0.55px). The generic default is a gama label; highlighting variants
 * (Good/Attention/Warning/Urgent = success/warning/orange/error -300 + black text) are applied by
 * the consumer via `className`/`style` (Type is not a component property here).
 */
export interface StyledLabelProps {
    /** @figmaProp none — the label text (auto-uppercased) */
    children: ReactNode
    /** @figmaProp none — behavioral */
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    /** @figmaProp Type — highlighting colour (bg/text) is applied here (success/warning/orange/error -300) */
    className?: string
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp none — inline colour override for highlighting variants */
    style?: CSSProperties
}
const styledLabelCss = style['styled-label']
export const StyledLabel: FC<StyledLabelProps> = ({ children, onClick, className, dataTest, style }) => {
    // Only when a consumer supplies `onClick` does this become interactive — add the matching
    // role/keyboard support so it's never a mouse-only div masquerading as clickable.
    const handleKeyDown = onClick
        ? (event: KeyboardEvent<HTMLDivElement>): void => {
              if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onClick(event as unknown as MouseEvent<HTMLDivElement>)
              }
          }
        : undefined

    return (
        <div
            className={clsx(styledLabelCss, className)}
            style={style}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            data-testid={dataTest}
        >
            {children}
        </div>
    )
}
