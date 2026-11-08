import { useState } from 'react'
import type { IMinimizableDialogV2Props } from './types'

interface ControlledProps {
    fullScreen: boolean
    setFullScreen: (fullScreen: boolean) => void
    minimized: boolean
    setMinimized: (minimized: boolean) => void
}

export const useControlledProps = ({
    fullScreenState,
    handleFullScreenState,
    minimizedState,
    handleMinimizedState,
}: IMinimizableDialogV2Props): ControlledProps => {
    const [_minimized, _setMinimized] = useState(false)
    const [_fullscreen, _setFullscreen] = useState(false)

    const fullScreen = fullScreenState ?? _fullscreen

    // The value is passed on, not dropped: a controlled consumer is told which state is wanted,
    // the same way `handleMinimizedState` is. A toggle-only handler keeps working — it just ignores
    // the argument, which is what every consumer written against the old signature does.
    const setFullScreen = (fullScreen: boolean) =>
        handleFullScreenState ? handleFullScreenState(fullScreen) : _setFullscreen(fullScreen)

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
