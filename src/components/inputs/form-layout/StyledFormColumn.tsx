import type { CSSProperties, ReactNode } from 'react'

export interface StyledFormColumnProps {
    children?: ReactNode
    className?: string
    dataTest?: string
    maxWidth?: CSSProperties['maxWidth']
}

/**
 * The one form column (field width pattern WID-1): at most 37.5rem (600 px), left-aligned, and as wide
 * as its container when that is narrower. Fields, labels, hints and errors all sit inside it.
 * A full-screen `MinimizableDialog` widens it to the dialog (WID-10). Pass `maxWidth` to uncap it
 * without changing the field-width tokens.
 */
export const StyledFormColumn = ({
    children,
    className,
    dataTest,
    maxWidth,
}: StyledFormColumnProps): JSX.Element => (
    <div
        data-testid={dataTest}
        className={className}
        style={{ width: '100%', maxWidth: maxWidth ?? 'var(--form-column-width)' }}
    >
        {children}
    </div>
)
