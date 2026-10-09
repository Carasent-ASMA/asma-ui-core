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
    fullScreenState?: boolean
    handleFullScreenState?: () => void
    locale?: 'no' | 'en'
    dataTest: string
}
