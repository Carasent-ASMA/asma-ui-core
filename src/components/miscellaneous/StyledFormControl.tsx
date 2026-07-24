import {
    useId,
    useMemo,
    useState,
    type CSSProperties,
    type FocusEventHandler,
    type MouseEventHandler,
    type ReactNode,
} from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import type { FieldSize } from '../inputs/field-styles'
import { FormControlContext, type FormControlContextValue } from './FormControlContext'

export interface FormControlProps {
    children?: ReactNode
    error?: boolean
    disabled?: boolean
    required?: boolean
    size?: FieldSize
    fullWidth?: boolean
    /** Accepted for API parity; the design always renders outlined. */
    variant?: string
    className?: string
    style?: CSSProperties
    sx?: unknown
    id?: string
    /** Forwarded to the container element (focus/blur bubble from inner controls) — e.g. clear a
     * validation error on focus, validate on blur, without a separate wrapper element. */
    onFocus?: FocusEventHandler<HTMLDivElement>
    onBlur?: FocusEventHandler<HTMLDivElement>
    onClick?: MouseEventHandler<HTMLDivElement>
}

/**
 * Form-field context provider + positioned container (replaces MUI `FormControl`). Tracks
 * focus/filled state so `StyledInputLabel` can float and `StyledFormHelperText` can colour itself;
 * `StyledSelect` reports its state into this context. Public props preserved (DEC-003). TASK-401.
 */
export const StyledFormControl = ({
    children,
    error = false,
    disabled = false,
    required = false,
    size = 'medium',
    fullWidth,
    className,
    style,
    sx,
    id,
    onFocus,
    onBlur,
    onClick,
}: FormControlProps): JSX.Element => {
    const generatedId = useId()
    const [focused, setFocused] = useState(false)
    const [filled, setFilled] = useState(false)

    const context = useMemo<FormControlContextValue>(
        () => ({
            focused,
            filled,
            error,
            disabled,
            required,
            size,
            labelId: id ?? generatedId,
            setFocused,
            setFilled,
        }),
        [focused, filled, error, disabled, required, size, id, generatedId],
    )

    return (
        <FormControlContext.Provider value={context}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions --
                Not a false positive to "fix" with role/tabIndex: this div wraps REAL interactive
                children (inputs/selects), which are already independently keyboard-operable. onFocus/
                onBlur only observe focus BUBBLING from those children (e.g. clear-error-on-focus,
                validate-on-blur) — they don't make the wrapper itself a control. onClick is a passthrough
                convenience. Giving the wrapper its own role='button'/tabIndex would misrepresent a
                multi-control container as one control to assistive tech. */}
            <div
                className={cn('relative inline-flex flex-col', fullWidth && 'w-full', className)}
                style={{ ...resolveSx(sx), ...style }}
                onFocus={onFocus}
                onBlur={onBlur}
                onClick={onClick}
            >
                {children}
            </div>
        </FormControlContext.Provider>
    )
}
