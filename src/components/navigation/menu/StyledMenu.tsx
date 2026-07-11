import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledPopover, type PopoverOrigin, type StyledPopoverProps } from '../../utils/popover'
import { StyledMenuList } from './StyledMenuList'

export interface MenuProps {
    open: boolean
    anchorEl?: Element | null
    onClose?: StyledPopoverProps['onClose']
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
}: MenuProps): JSX.Element => (
    <StyledPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        id={id}
        className={className}
        sx={sx}
        slotProps={{
            paper: {
                className: cn('rounded', classes?.paper, slotProps?.paper?.className),
                sx: [MENU_PAPER_STYLE, slotProps?.paper?.sx],
                style: slotProps?.paper?.style,
            },
        }}
    >
        <StyledMenuList autoFocus={autoFocus} className={classes?.list} onClick={onClick}>
            {children}
        </StyledMenuList>
    </StyledPopover>
)
