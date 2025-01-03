import type { ReactNode } from 'react'

export type IFloatingWindowProps = {
    fullScreen: boolean
}

export type IMinimizableDialogProps = {
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
    secondaryButtonText?: string
    onPrimaryButtonClick?: () => void
    onSecondaryButtonClick?: () => void
    extraActions?: () => void | { label: string; className?: string; onClick: () => void }[]
    extraActionsText?: string
    btnContainerClassName?: string
    footerClassName?: string
    footerInfo?: ReactNode
    enableFullscreen?: boolean
    dataTest: string
}
