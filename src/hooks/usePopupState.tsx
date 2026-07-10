import { type ReactNode, useCallback, useMemo, useState } from 'react'

/**
 * Dependency-free popup state primitive — a drop-in for the small slice of
 * `material-ui-popup-state` most apps use: a `PopupState` render-prop / `usePopupState` hook plus
 * `bindTrigger`/`bindPopper`/`bindPopover` helpers. `open`/`toggle` accept a React event or an
 * element and derive the anchor from `currentTarget`; the bind helpers produce the prop shapes
 * consumed by MUI `Popover`/`Popper` (and this library's `StyledPopover`).
 */

type PopupVariant = 'popover' | 'popper'
type OpenArg = React.SyntheticEvent<Element> | Element | null | undefined

export interface PopupState {
    isOpen: boolean
    anchorEl: HTMLElement | undefined
    popupId?: string
    variant: PopupVariant
    open: (eventOrAnchorEl?: OpenArg) => void
    close: () => void
    toggle: (eventOrAnchorEl?: OpenArg) => void
    setAnchorEl: (el: HTMLElement | undefined) => void
}

export type InjectedProps = PopupState

interface ControlAriaProps {
    'aria-controls': string | undefined
    'aria-describedby': string | undefined
    'aria-haspopup': true | undefined
}

type TriggerBindProps = ControlAriaProps & {
    onClick: PopupState['open']
    onTouchStart: PopupState['open']
}

interface PopoverBindProps {
    anchorEl: HTMLElement | undefined
    id: string | undefined
    onClose: () => void
    open: boolean
}

interface PopperBindProps {
    anchorEl: HTMLElement | undefined
    id: string | undefined
    open: boolean
}

const resolveAnchor = (eventOrAnchorEl?: OpenArg): HTMLElement | undefined => {
    if (eventOrAnchorEl instanceof Element) return eventOrAnchorEl as HTMLElement
    const currentTarget = (eventOrAnchorEl as React.SyntheticEvent | undefined)?.currentTarget
    return currentTarget instanceof Element ? (currentTarget as HTMLElement) : undefined
}

export const usePopupState = ({ popupId, variant }: { popupId?: string; variant: PopupVariant }): PopupState => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined)
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback((eventOrAnchorEl?: OpenArg) => {
        const el = resolveAnchor(eventOrAnchorEl)
        if (el) setAnchorEl(el)
        setIsOpen(true)
    }, [])

    const close = useCallback(() => setIsOpen(false), [])

    const toggle = useCallback((eventOrAnchorEl?: OpenArg) => {
        const el = resolveAnchor(eventOrAnchorEl)
        if (el) setAnchorEl(el)
        setIsOpen((prev) => !prev)
    }, [])

    return useMemo(
        () => ({ anchorEl, close, isOpen, open, popupId, setAnchorEl, toggle, variant }),
        [anchorEl, close, isOpen, open, popupId, toggle, variant],
    )
}

export const PopupState = ({
    variant,
    popupId,
    children,
}: {
    variant: PopupVariant
    popupId?: string
    children: (popupState: PopupState) => ReactNode
}): JSX.Element => {
    const popupState = usePopupState({ popupId, variant })
    return <>{children(popupState)}</>
}

const controlAriaProps = (state: PopupState): ControlAriaProps => ({
    'aria-controls': state.variant === 'popover' && state.isOpen ? state.popupId : undefined,
    'aria-describedby': state.variant === 'popper' && state.isOpen ? state.popupId : undefined,
    'aria-haspopup': state.variant === 'popover' ? (true as const) : undefined,
})

export const bindTrigger = (state: PopupState): TriggerBindProps => ({
    ...controlAriaProps(state),
    onClick: state.open,
    onTouchStart: state.open,
})

export const bindPopover = (state: PopupState): PopoverBindProps => ({
    anchorEl: state.anchorEl,
    id: state.popupId,
    onClose: state.close,
    open: state.isOpen,
})

export const bindPopper = (state: PopupState): PopperBindProps => ({
    anchorEl: state.anchorEl,
    id: state.popupId,
    open: state.isOpen,
})
