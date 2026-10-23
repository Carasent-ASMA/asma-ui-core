import type { ReactNode } from 'react'

export interface IFloatingWindowProps {
    fullScreen: boolean
}

export interface IMinimizableDialogProps {
    onCloseText?: string
    onMinimizeText?: string
    onExpandText?: string
    onFullScreenText?: string
    open: boolean
    onClose: () => void
    actionNode?: React.ReactNode
    showCloseIcon?: boolean
    showMinimizeIcon?: boolean
    showExpandIcon?: boolean
    showFullScreenIcon?: boolean
    title: ReactNode
    label?: ReactNode
    children?: React.ReactNode | ((props: IFloatingWindowProps) => ReactNode)
    className?: string
    primaryButtonText?: string
    /**
     * @figmaProp none — behavioral. Busy: the primary button shows a spinner and ignores activation;
     * the secondary button, Esc and the close button wait with the reason "Wait until saved" (DIS-8).
     */
    primaryButtonLoading?: boolean
    /** @figmaProp none — behavioral. Disables the primary button; pair it with `primaryButtonDisabledReason`. */
    primaryButtonDisabled?: boolean
    /**
     * @figmaProp none — behavioral. Why the primary action is unavailable. With `primaryButtonDisabled`
     * the button stays focusable and shows the reason on hover, focus and tap (disabled-states DIS-1…DIS-4).
     */
    primaryButtonDisabledReason?: ReactNode
    secondaryButtonText?: string
    onPrimaryButtonClick?: () => void
    onSecondaryButtonClick?: () => void
    extraActions?: { label: string; className?: string; onClick: () => void }[] | (() => void)
    extraActionsText?: string
    btnContainerClassName?: string
    footerClassName?: string
    footerInfo?: ReactNode
    enableFullscreen?: boolean
    /**
     * Why fullscreen cannot be left, for a dialog that only ever runs fullscreen.
     *
     * While set, the fullscreen toggle is **shown disabled** with this reason rather than hidden:
     * the header's minimize / fullscreen / close triad is a place people have learned, so a control
     * missing from it reads as "this dialog cannot do that" instead of "not here, and here is why"
     * (hide-or-disable HOD-4, disabled-states DIS-1/2/3). `StyledButton` keeps it focusable with
     * `aria-disabled` and opens the reason on hover, focus and tap.
     *
     * App-owned and localized: shared components render no default reason, so leaving this unset
     * keeps today's behaviour.
     */
    fullscreenLockedReason?: ReactNode
    fullScreenState?: boolean
    /**
     * Called with the state being asked for, mirroring `handleMinimizedState`. A zero-argument
     * toggle stays valid — TypeScript accepts the narrower signature, and the extra argument is
     * ignored at runtime — so existing consumers need no change.
     */
    handleFullScreenState?: (fullScreen: boolean) => void
    locale?: 'no' | 'en'
    dataTest: string
}
