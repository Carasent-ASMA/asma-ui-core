import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledPopover, type PopoverCloseReason, type PopoverOrigin } from '../../utils/popover'
import { StyledMenuList } from './StyledMenuList'
export type MenuCloseReason = PopoverCloseReason | 'tabKeyDown'

export interface MenuProps {
    open: boolean
    anchorEl?: Element | null
    onClose?: (event: object, reason?: MenuCloseReason) => void
    anchorOrigin?: PopoverOrigin
    transformOrigin?: PopoverOrigin
    id?: string
    className?: string
    sx?: unknown
    classes?: { paper?: string; list?: string }
    /** MUI `Menu` `slotProps.paper` parity (DEC-003): styles/classes forwarded to the menu paper. */
    slotProps?: { paper?: { className?: string; sx?: unknown; style?: CSSProperties } }
    autoFocus?: boolean
    onClick?: (event: MouseEvent<HTMLUListElement>) => void
    children?: ReactNode
    /** MUI `Menu` `keepMounted` parity — see `StyledPopover.keepMounted`. */
    keepMounted?: boolean
}

// Menu paper look (border + soft shadow) applied as flat sx → inline so it overrides StyledPopover's
// base class shadow without tailwind-merge (dropped in Phase 0).
const MENU_PAPER_STYLE = {
    border: '1px solid var(--colors-delta-300)',
    boxShadow: '0px 2px 4px 0px rgba(34, 33, 51, 0.15)',
}

/**
 * Anchored menu (replaces MUI `Menu`) = `StyledPopover` + a keyboard-navigable `StyledMenuList`.
 * Public props (`open`/`anchorEl`/`onClose`/`anchorOrigin`/`classes`/`autoFocus`) preserved
 * (DEC-003). TASK-303.
 */
export const StyledMenu = ({
    open,
    anchorEl,
    onClose,
    anchorOrigin,
    transformOrigin,
    id,
    className,
    sx,
    classes,
    slotProps,
    autoFocus = true,
    onClick,
    children,
    keepMounted,
}: MenuProps): JSX.Element => (
    <StyledPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        tabIntoContent={false}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        id={id}
        className={className}
        sx={sx}
        keepMounted={keepMounted}
        slotProps={{
            paper: {
                className: cn('rounded', classes?.paper, slotProps?.paper?.className),
                sx: [MENU_PAPER_STYLE, slotProps?.paper?.sx],
                style: slotProps?.paper?.style,
            },
        }}
    >
        <StyledMenuList
            /* False positive: this `autoFocus` is a custom StyledMenuList prop (imperative `.focus()`
               in a useEffect, not the native HTML attribute the rule targets) implementing the
               WAI-ARIA Menu pattern — focus the first item when the menu opens. Not the page-load
               focus-steal the rule guards against. */
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
            className={classes?.list}
            onClick={onClick}
            // WAI-ARIA Menu pattern, Tab: "When focus is on a menuitem ... move focus out of the
            // menu and close all menus". The condition is load-bearing, not decoration — `StyledMenu`
            // is also the surface for popovers whose content is arbitrary (a search field over a
            // filter list, e.g. the editor's `SearchFilterMenu`). Tab between those controls is
            // ordinary movement inside the panel and must not dismiss it.
            // Deliberately no preventDefault: the browser still performs the focus move, and
            // StyledPopover's close restores focus to the trigger first, so Tab continues from the
            // trigger to the next control instead of from a node that is being unmounted.
            onKeyDown={(event) => {
                if (event.key === 'Tab' && (event.target as HTMLElement).getAttribute('role') === 'menuitem')
                    onClose?.(event, 'tabKeyDown')
            }}
        >
            {children}
        </StyledMenuList>
    </StyledPopover>
)
