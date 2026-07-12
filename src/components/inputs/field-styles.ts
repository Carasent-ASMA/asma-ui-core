import { cn } from 'src/helpers/cn'

/**
 * Shared outlined-field styling so `StyledInputField`, `StyledInputLabel` (+ `StyledFormControl`)
 * and `StyledSelect` render an identical border + floating label without MUI. TASK-401.
 */

export type FieldSize = 'small' | 'medium'

interface FieldState {
    focused?: boolean
    error?: boolean
    disabled?: boolean
    readOnly?: boolean
}

/** The border overlay (an absolutely-positioned sibling so width changes never reflow the input). */
export const outlineClass = ({ focused, error, disabled, readOnly }: FieldState): string =>
    cn(
        'pointer-events-none absolute inset-0 rounded-lg border transition-colors',
        disabled
            ? 'border-delta-300'
            : readOnly
              ? 'border-delta-200'
              : error
                ? 'border-2 border-error-500'
                : focused
                  ? 'border-2 border-gama-400'
                  : 'border-delta-500 group-hover:border-2',
    )

/**
 * The floating label. `shrink` lifts it onto the top border (white background masks the line —
 * the technique the old FormControl `sx` used, so no fieldset/legend notch is needed).
 */
export const floatingLabelClass = ({
    shrink,
    focused,
    error,
    disabled,
    size = 'medium',
}: FieldState & { shrink: boolean; size?: FieldSize }): string =>
    cn(
        'pointer-events-none absolute left-3 z-10 max-w-[calc(100%-1.5rem)] truncate transition-all duration-150',
        // Colour precedence: disabled → error → focused → resting/shrunk.
        disabled
            ? 'text-gray-300'
            : error
              ? 'text-error-500'
              : focused
                ? 'text-gama-500'
                : shrink
                  ? 'text-delta-800'
                  : 'text-delta-500',
        shrink
            ? 'top-0 -translate-y-1/2 bg-white px-1 text-xs'
            : cn('top-1/2 -translate-y-1/2', size === 'small' ? 'text-sm' : 'text-base'),
    )
