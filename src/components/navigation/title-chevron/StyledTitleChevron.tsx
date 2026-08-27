import type { MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { ChevronRightIcon } from 'src/components/icons/chevron-right-icon/ChevronRightIcon'

/** @figmaNode wXrXt5uKNNzV2DnQCgyYZH#32070-223003 (Design-System · "Title+chevron") */
export interface StyledTitleChevronProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp none — the title label slot. Plain text truncates to one line. */
    children: ReactNode
    /** @figmaProp none — behavioral: navigate to the target page / dialog / section. */
    onClick: (event: MouseEvent<HTMLButtonElement>) => void
    /** @figmaProp Size = base→"Base" (Helper SemiBold 14/20, chevron 20) | medium→"Medium" (Body Base SemiBold 16/24, chevron 24) | subtitle→"Subtitle" (Subtitle 20/28, chevron 28) */
    size?: 'base' | 'medium' | 'subtitle'
    /** @figmaProp none — style escape hatch */
    className?: string
}

const SIZE_TEXT: Record<NonNullable<StyledTitleChevronProps['size']>, string> = {
    base: 'text-sm',
    medium: 'text-base',
    subtitle: 'text-xl',
}

const SIZE_ICON: Record<NonNullable<StyledTitleChevronProps['size']>, number> = {
    base: 20,
    medium: 24,
    subtitle: 28,
}

/**
 * Clickable title row signalling that a card / list-item header navigates somewhere (calendars,
 * network cards, pathfinder lists). Per the Figma pattern notes: the chevron is **always visible**
 * (never revealed on hover), sits flush against the text at rest, and on hover/focus nudges
 * **+4px right** via transform only — no layout shift. Text `title-label` (delta-800 #363e4a) →
 * `primary` (gama-500) on hover/focus. The whole row is one native `<button>` (Enter/Space for
 * free) with a ≥44px tap target and a visible gama-400 focus ring. State (Default/Hovered) derives
 * from `:hover`/`:focus-visible`/`:active` at runtime, not a prop. The Figma `chevron` boolean is
 * deliberately not exposed — a chevron-less title is a read-only heading, not this component.
 */
export const StyledTitleChevron: React.FC<StyledTitleChevronProps> = ({
    dataTest,
    children,
    onClick,
    size = 'base',
    className,
}) => (
    <button
        type='button'
        data-test={dataTest}
        data-testid={dataTest}
        onClick={onClick}
        className={cn(
            'group flex min-h-11 w-full cursor-pointer items-center rounded border-0 bg-transparent p-0 text-left',
            'font-semibold text-delta-800 transition-colors duration-300',
            SIZE_TEXT[size],
            'hover:text-gama-500 focus-visible:text-gama-500 active:text-gama-600',
            'outline-gama-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            className,
        )}
    >
        <span className='min-w-0 truncate'>{children}</span>
        <ChevronRightIcon
            width={SIZE_ICON[size]}
            height={SIZE_ICON[size]}
            aria-hidden
            className='shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1'
        />
    </button>
)
