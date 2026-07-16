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
        'pointer-events-none absolute inset-0 rounded border border-solid transition-colors',
        disabled
            ? 'border-delta-300'
            : readOnly
              ? 'border-delta-200'
              : error
                ? cn('border-error-500', focused && 'border-2')
                : focused
                  ? 'border-2 border-gama-400' // Figma border/focus #1ca1a1 (node 15561-37298)
                  : 'border-delta-500 group-hover:border-2 group-hover:border-gama-300', // Figma border/hover #60bdbd
    )

/** MUI-compatible fieldset outline used by text fields with floating labels. */
export const notchedOutlineClass = ({
    focused,
    error,
    disabled,
    readOnly,
    notched = true,
}: FieldState & { notched?: boolean }): string =>
    cn(
        'pointer-events-none absolute z-0 m-0 box-border min-w-0 overflow-hidden rounded border border-solid transition-colors',
        // ponytail: notch only when a label needs the gap — no label = inset-0 so border is exactly 40px
        notched ? 'inset-x-0 bottom-0 top-[-5px] px-2 py-0' : 'inset-0',
        disabled
            ? 'border-delta-300'
            : readOnly
              ? 'border-delta-200'
              : error
                ? 'border-error-500'
                : focused
                  ? 'border-2 border-gama-400' // Figma border/focus #1ca1a1 (node 15561-37298)
                  : 'border-delta-500 group-hover:border-2 group-hover:border-gama-300', // Figma border/hover #60bdbd
    )

export const notchedLegendClass = (shrink: boolean): string =>
    cn(
        'invisible block h-[11px] overflow-hidden p-0 text-xs leading-[23px] transition-[max-width] duration-150',
        shrink ? 'max-w-full' : 'max-w-[0.01px]',
    )

/**
 * The floating label. `shrink` lifts it onto the top border (outside the 40px input box).
 * Resting state centers in the field as a placeholder surrogate.
 */
export const floatingLabelClass = ({
    shrink,
    focused,
    error,
    disabled,
    readOnly,
    size = 'medium',
}: FieldState & { shrink: boolean; size?: FieldSize }): string =>
    cn(
        'pointer-events-none absolute left-[14px] z-10 max-w-[calc(100%-1.75rem)] truncate transition-all duration-150',
        // Colour precedence: disabled → error → focused → resting/shrunk.
        disabled
            ? 'text-delta-300'
            : readOnly
              ? 'text-delta-800'
              : error
                ? 'text-error-500'
                : focused
                  ? 'text-gama-500'
                  : shrink
                    ? 'text-delta-800'
                    : 'text-delta-500',
        shrink
            ? 'top-0 -translate-y-1/2 bg-white px-1 text-xs leading-[16px] tracking-[0.24px]' // Figma Small 12/16, ls 0.24px
            : cn('top-1/2 -translate-y-1/2', size === 'small' ? 'text-sm' : 'text-base leading-[23px] tracking-[0.00938em]'),
    )
