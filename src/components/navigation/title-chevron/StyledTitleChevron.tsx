import type { MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { ChevronRightIcon } from 'src/components/icons/chevron-right-icon/ChevronRightIcon'

export interface StyledTitleChevronProps {
    dataTest: string
    /** The title label. Plain text truncates to one line. */
    children: ReactNode
    /** Navigate to the target page / dialog / section. */
    onClick: (event: MouseEvent<HTMLButtonElement>) => void
    /** Title typography — `medium` = Body Medium 16/24 (default), `large` = 18/28 widget headings. */
    size?: 'medium' | 'large'
    className?: string
}

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#32027-180872 (Design-System · "Title + Chevron")
 *
 * Clickable title row signalling that a card / list-item header navigates somewhere (calendars,
 * network cards, pathfinder lists). The chevron is **always visible**; on hover/focus the row turns
 * gama-500 and the chevron nudges +4px right (transform only — no layout shift). The whole row is
 * one native `<button>` (Enter/Space for free) with a ≥44px tap target and a visible gama-400
 * focus ring. States (Default/Hovered/Active/Focused) derive from `:hover`/`:focus-visible`/`:active`,
 * not props.
 */
export const StyledTitleChevron: React.FC<StyledTitleChevronProps> = ({
    dataTest,
    children,
    onClick,
    size = 'medium',
    className,
}) => (
    <button
        type='button'
        data-test={dataTest}
        data-testid={dataTest}
        onClick={onClick}
        className={cn(
            'group flex min-h-11 w-full cursor-pointer items-center gap-1 rounded border-0 bg-transparent p-0 text-left',
            'font-semibold text-delta-800 transition-colors duration-300',
            size === 'large' ? 'text-lg' : 'text-base',
            'hover:text-gama-500 focus-visible:text-gama-500 active:text-gama-600',
            'outline-gama-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            className,
        )}
    >
        <span className='min-w-0 truncate'>{children}</span>
        <ChevronRightIcon
            width={size === 'large' ? 24 : 20}
            height={size === 'large' ? 24 : 20}
            aria-hidden
            className='shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1'
        />
    </button>
)
