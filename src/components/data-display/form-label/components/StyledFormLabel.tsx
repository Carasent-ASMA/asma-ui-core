import type { KeyboardEvent, MouseEvent } from 'react'
import clsx from 'clsx'
import { getStyles } from '../helpers/getStyles'
import type { IStyledFormLabel } from '../types'

export const StyledFormLabel: React.FC<IStyledFormLabel> = ({ title, onClick, className, dataTest, size = 'base' }) => {
    const styles = getStyles({ size })

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
            className={clsx(styles, className)}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            data-testid={dataTest}
        >
            {title}
        </div>
    )
}
