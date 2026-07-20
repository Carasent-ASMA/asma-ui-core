import type { ReactNode } from 'react'
export type ILocale = 'en' | 'no'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#20049-111828 (Design-System · "Dialog minimized")
 *
 * Bespoke bottom-right minimizable dialog (no single DS component). It reuses the DS **modal family**
 * conventions from `StyledDialog`: paper white radius 8 + **Dialogue-popup** shadow (#22213366, 0 4 40),
 * fullscreen overlay `bg/modal` #626e7e @70%, header title Page title 24/32 SemiBold `delta-800` +
 * optional Helper `delta-700` label over a `delta-200` divider. The **minimized bar** matches the DS
 * "Dialog minimized" node: radius 8, Dialogue-popup shadow, Section title 18/28 SemiBold `delta-800`.
 * (Minimized expand/close are compact icon-only buttons — deliberately terser than the labelled Figma
 * variant to keep the bar narrow for the multi-dialog Stack.) Token-clean; no visual change this pass.
 *
 * Positioning (`--dialog-right`/width/`bottom-4`) is owned by `createDialogStack`; do not restyle it.
 */
export interface IMinimizableDialogV2Props {
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
