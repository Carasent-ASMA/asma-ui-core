import { useState } from 'react'
import type { IMinimizableDialogV2Props } from './types'

export const useControlledProps = ({
    fullScreenState,
    handleFullScreenState,
    minimizedState,
    handleMinimizedState,
}: IMinimizableDialogV2Props) => {
    const [_minimized, _setMinimized] = useState(false)
    const [_fullscreen, _setFullscreen] = useState(false)

    const fullScreen = fullScreenState ?? _fullscreen

    const setFullScreen = (fullScreen: boolean) =>
        handleFullScreenState ? handleFullScreenState() : _setFullscreen(fullScreen)

    const minimized = minimizedState ?? _minimized

    const setMinimized = (minimized: boolean) =>
        handleMinimizedState ? handleMinimizedState(minimized) : _setMinimized(minimized)

    return {
        fullScreen,
        setFullScreen,
        minimized,
        setMinimized,
    }
}
