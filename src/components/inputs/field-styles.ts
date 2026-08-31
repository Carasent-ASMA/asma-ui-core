import type { CSSProperties } from 'react'
import { cn } from 'src/helpers/cn'

/** Figma single-line outlined field height — pinned inline so duplicate app CSS cannot resize the box. */
export const SINGLE_LINE_FIELD_HEIGHT_PX = 40

/** Inline layout for the 40px input shell; spread caller styles first, then this. */
export const singleLineShellLayoutStyle = (): CSSProperties => ({
    boxSizing: 'border-box',
    height: SINGLE_LINE_FIELD_HEIGHT_PX,
    minHeight: SINGLE_LINE_FIELD_HEIGHT_PX,
    maxHeight: SINGLE_LINE_FIELD_HEIGHT_PX,
})

export interface SingleLineInputLayoutOptions {
    paddingLeft?: CSSProperties['paddingLeft']
    paddingRight?: CSSProperties['paddingRight']
}

/** Inline layout for the single-line `<input>`; spread caller/htmlInput styles first, then this. */
export const singleLineInputLayoutStyle = ({
    paddingLeft = 14,
    paddingRight = 14,
}: SingleLineInputLayoutOptions = {}): CSSProperties => ({
    boxSizing: 'border-box',
    margin: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft,
    paddingRight,
    height: SINGLE_LINE_FIELD_HEIGHT_PX,
    minHeight: SINGLE_LINE_FIELD_HEIGHT_PX,
    maxHeight: SINGLE_LINE_FIELD_HEIGHT_PX,
    lineHeight: '24px',
    fontSize: 16,
})

/** Label vertical anchor — inline so duplicate Tailwind `top-*` utilities cannot shift it. */
export const floatingLabelLayoutStyle = (shrink: boolean): CSSProperties =>
    shrink ? { top: 0, transform: 'translateY(-50%)' } : { top: '50%', transform: 'translateY(-50%)' }

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
    /** `variant="standard"`: same geometry as the outlined field, but the border is painted on focus only. */
    borderless?: boolean
}

/** The border overlay (an absolutely-positioned sibling so width changes never reflow the input). */
export const outlineClass = ({ focused, error, disabled, readOnly, borderless }: FieldState): string =>
    cn(
        'pointer-events-none absolute inset-0 rounded border border-solid transition-colors',
        borderless && !focused
            ? 'border-transparent'
            : disabled
              ? 'border-delta-300'
              : readOnly
                ? 'border-delta-200'
                : error
                  ? 'border-error-500'
                  : focused
                    ? 'border-[3px] border-gama-400' // Figma border/focus #1ca1a1 (node 15561-37298)
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
                  ? 'border-[3px] border-gama-400' // Figma border/focus #1ca1a1 (node 15561-37298)
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
}: FieldState & { shrink: boolean; size?: FieldSize }): string =>
    cn(
        // ponytail: position lives in `floatingLabelLayoutStyle` (inline) — not `transition-all`, which
        // animates mount-on-focus labels from a wrong resting point when duplicate app CSS shifts the shell.
        'pointer-events-none absolute left-[14px] z-10 max-w-[calc(100%-1.75rem)] truncate transition-colors duration-150',
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
            ? 'bg-white px-1 text-xs leading-[16px] tracking-[0.24px]' // Figma Small 12/16, ls 0.24px
            // Resting label doubles as the placeholder → must match the input text (Figma Body Base 16,
            // `text-base`) at every `size`; a smaller size only changes height/padding, not text size.
            : 'text-base leading-[23px] tracking-[0.00938em]',
    )
