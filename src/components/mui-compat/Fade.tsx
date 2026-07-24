import { cloneElement, useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import { cn } from 'src/helpers/cn'
import styles from './Fade.module.scss'

type Timeout = number | { enter?: number; exit?: number }

export interface FadeProps {
    in?: boolean
    timeout?: Timeout
    appear?: boolean
    children: ReactElement
    onEnter?: () => void
    onExited?: () => void
    style?: CSSProperties
}

const resolveDuration = (timeout: Timeout, phase: 'enter' | 'exit'): number =>
    typeof timeout === 'number' ? timeout : (timeout[phase] ?? 225)

/**
 * Opacity transition (replaces MUI `Fade`). Clones its single child and runs a CSS keyframe on
 * enter/exit, keeping the child mounted through the exit tween before calling `onExited` (so a
 * parent `Popper` can unmount it). Public props preserved (DEC-003). TASK-403.
 */
export const Fade = ({
    in: inProp = true,
    timeout = 225,
    children,
    onExited,
    style,
}: FadeProps): JSX.Element | null => {
    const [rendered, setRendered] = useState(inProp)
    // Mount as soon as we open (adjust-state-during-render — React's documented pattern).
    if (inProp && !rendered) setRendered(true)

    useEffect(() => {
        if (inProp) return
        const timer = setTimeout(() => {
            setRendered(false)
            onExited?.()
        }, resolveDuration(timeout, 'exit'))
        return () => clearTimeout(timer)
    }, [inProp, timeout, onExited])

    if (!rendered) return null

    const childProps = children.props as { style?: CSSProperties; className?: string }
    return cloneElement(children, {
        className: cn(childProps.className, inProp ? styles['fadeIn'] : styles['fadeOut']),
        style: {
            ...childProps.style,
            ...style,
            ['--fade-duration' as string]: `${resolveDuration(timeout, inProp ? 'enter' : 'exit')}ms`,
        },
    } as Partial<{ style: CSSProperties; className: string }>)
}
