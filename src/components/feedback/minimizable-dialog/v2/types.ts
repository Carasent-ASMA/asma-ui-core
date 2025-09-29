import type { ReactNode } from 'react'
export type ILocale = 'en' | 'no'

export type IMinimizableDialogV2Props = {
    open: boolean
    onClose: () => void
    actionNode?: React.ReactNode
    showCloseIcon?: boolean
    showMinimizeIcon?: boolean
    showExpandIcon?: boolean
    showFullScreenIcon?: boolean
    title: ReactNode
    label?: ReactNode
    children?: React.ReactNode
    classNameOverrides?: {
        maximized?: string
        minimized?: string
        fullscreen?: string
    }
    locale?: ILocale
    dataTest: string
    style?: React.CSSProperties
    //
    minimizedState?: boolean
    handleMinimizedState?: (minimized: boolean) => void
    //
    enableFullscreen?: boolean
    fullScreenState?: boolean
    handleFullScreenState?: () => void
}
