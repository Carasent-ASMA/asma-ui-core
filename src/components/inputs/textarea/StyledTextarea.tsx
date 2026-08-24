import React, { useEffect, useId, useRef, type ChangeEvent, type MutableRefObject, type ReactNode } from 'react'
import { useHelperAlertRole } from 'src/helpers/useHelperAlertRole'
import { warnMissingErrorMessage } from 'src/helpers/warnMissingErrorMessage'
import styles from './StyledTextarea.module.scss'

export interface TextareaCommonProps {
    id?: string
    /** @figmaProp Filled — the field text (Body Base 16/lh24, delta-800). */
    value?: string
    /** @figmaProp Title (Body Base SemiBold 16, delta-800) above the field. */
    label?: ReactNode
    labelClassName?: string
    /** @figmaProp Description / helper text (Helper 14/lh20, delta-600). */
    description?: ReactNode
    reserveHelperText?: boolean
    containerClassName?: string
    className?: string
    dataTest?: string
}

export interface TextAreaNotEditableProps {
    variant?: 'not_editable' | 'view_only'
    minRows?: never
    maxRows?: never
    disabled?: never
    placeholder?: never
    error?: never
    errorMessage?: never
    onChange?: never
    maxLength?: never
    counter?: never
    refLink?: never
    counterLimit?: never
}

export interface TextAreaActiveProps {
    variant?: 'active'
    minRows?: number
    maxRows?: number
    /** @figmaProp State = true→"Disabled" (delta-300 border/text) */
    disabled?: boolean
    /** @figmaProp Placeholder text (resting, delta-500) */
    placeholder?: string
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
    /** @figmaProp State = true→"Error" (border/text error-500) */
    error?: boolean
    errorMessage?: string
    maxLength?: number
    counter?: boolean
    refLink?: MutableRefObject<HTMLTextAreaElement | null> | null | undefined
    counterLimit?: number
}
type TextareaConditionalProps = TextAreaActiveProps | TextAreaNotEditableProps
type StyledTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
    TextareaCommonProps &
    TextareaConditionalProps

type TextareaTypes = 'active' | 'error'
type textTypes = 'active' | 'error' | 'disabled'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15561-37391
 * Figma has no standalone "Text area" component — a multiline text control inherits the **Input
 * field** outlined styling (shared with `StyledInputField`/`field-styles`): radius 4, field text
 * **Body Base 16/lh24 delta-800**; border **enabled delta-500 #7a899e**, **hover gama-300 #60bdbd
 * (2px)**, **focus gama-400 #1ca1a1 (2px)**, **error error-500 #e10700**, **disabled delta-300**.
 * Title = **Body Base SemiBold 16 delta-800**; description/helper = **Helper 14/lh20 delta-600**.
 * State (Enabled/Hover/Focus/Error/Disabled) ← native + `error`/`disabled`; the `not_editable`/
 * `view_only` variants are the read-only presentations. Colours live in the textarea-only
 * `--colors-input-*` token layer (now referencing the semantic delta/gama tokens, so all themes
 * recolour). Non-annotated props are behavioral.
 *
 * Developer: bularga.alexandru@carasent.com
 *
 * Custom props:
 * @figmaProp variant — active (editable field) | view_only | not_editable (read-only presentations)
 * @figmaProp error — State = true→"Error" (border/text error-500)
 * @param variant -  'not_editable' | 'view_only' | 'active'
 * @param error -  boolean
 * @param errorMessage -  string
 * @param minRows -  number
 * @param maxRows -  number
 * @param counter -  number
 * @param maxLength -  number
 * @param refLink -  ref to component
 * @param dataTest -  data-test tag
 *
 */
export const StyledTextarea: React.FC<StyledTextAreaProps> = ({
    id,
    variant = 'active',
    label = '',
    labelClassName = '',
    description = '',
    reserveHelperText = true,
    value = '',
    minRows = 3,
    maxRows = Infinity,
    disabled,
    error,
    errorMessage,
    containerClassName = '',
    className = '',
    maxLength = Infinity,
    counter,
    refLink,
    dataTest,
    counterLimit,
    ...otherProps
}) => {
    const textAreaInnerRef = useRef<HTMLTextAreaElement>(null)
    const textAreaRef = refLink ?? textAreaInnerRef
    const counterEnabled = !!(counter && counterLimit)

    const descriptionId = useId()
    const counterId = useId()
    const internalId = useId()
    const textAreaId = id ?? internalId
    const helperMessage = error ? errorMessage : description
    const showHelperSlot = reserveHelperText || helperMessage != null || Boolean(error)
    warnMissingErrorMessage('StyledTextarea', error, errorMessage)
    const helperAlertRole = useHelperAlertRole(error)

    useEffect(() => {
        const textArea = textAreaRef.current
        if (!textArea) return
        const computedStyle = window.getComputedStyle(textArea)
        const rowHeight = parseFloat(computedStyle.lineHeight) || 24
        const paddingTop = parseFloat(computedStyle.paddingTop)
        const paddingBottom = parseFloat(computedStyle.paddingBottom)

        // Measure the natural content height, then size to a whole number of rows clamped to
        // [minRows, maxRows]. `scrollHeight` already includes BOTH paddings — the box is `border-box`,
        // so `rows*rowHeight + paddingTop + paddingBottom` is the exact height (no extra bottom gap,
        // and short text keeps the minRows height instead of collapsing/resizing on the first line).
        textArea.style.height = 'auto'
        const contentHeight = textArea.scrollHeight - paddingTop - paddingBottom
        const contentRows = Math.max(1, Math.ceil(contentHeight / rowHeight))
        const rows = Math.min(Math.max(contentRows, minRows), maxRows)
        textArea.style.height = `${rows * rowHeight + paddingTop + paddingBottom}px`
    }, [textAreaRef, value, minRows, maxRows, counterEnabled])

    if (maxRows < minRows) {
        minRows = maxRows
    }

    const textareaType: TextareaTypes = error ? 'error' : 'active'

    const textType: textTypes = error ? 'error' : disabled ? 'disabled' : 'active'

    // The associated <label> contributes no accessible name when `label` is left empty (a
    // supported, label-less state) — fall back to the description, then the placeholder, so the
    // field still has a real name instead of only a `title` attribute (axe `label-title-only`).
    const hasVisibleLabel = typeof label !== 'string' || label.trim() !== ''
    const fallbackName = hasVisibleLabel
        ? undefined
        : typeof description === 'string' && description.trim() !== ''
          ? description
          : otherProps.placeholder

    return (
        <div className={`relative flex flex-col gap-1 ${containerClassName}`} data-testid={dataTest}>
            <label htmlFor={textAreaId} className={`${styles['label']} ${styles[textType]} ${labelClassName}`}>
                {label}
            </label>
            {showHelperSlot && (
                <span
                    id={descriptionId}
                    role={helperAlertRole}
                    className={`${styles['description']} ${styles[textType]} min-h-[24px]`}
                >
                    {helperMessage}
                </span>
            )}
            {variant === 'view_only' ? (
                <div className='pt-3 font-roboto text-base font-normal text-delta-700'>{value}</div>
            ) : variant === 'not_editable' ? (
                <div className='rounded bg-delta-50 p-3 font-roboto text-base font-normal text-delta-700'>{value}</div>
            ) : (
                <textarea
                    {...otherProps}
                    aria-describedby={
                        [showHelperSlot ? descriptionId : null, counterEnabled ? counterId : null]
                            .filter(Boolean)
                            .join(' ') || undefined
                    }
                    aria-invalid={error}
                    aria-label={fallbackName}
                    id={textAreaId}
                    ref={textAreaRef}
                    className={`${styles['textarea']} ${styles[textareaType]} ${className} ${
                        counterEnabled ? 'pb-[32px]' : ''
                    }`}
                    wrap='soft'
                    value={value}
                    disabled={disabled}
                    maxLength={maxLength}
                />
            )}
            {counterEnabled && (
                <>
                    <div className='pointer-events-none absolute bottom-3 right-3 flex h-[15px] justify-end font-roboto text-[10px]'>
                        {value.length}/{counterLimit}
                    </div>

                    <div id={counterId} aria-live='polite' className='sr-only'>
                        {counterLimit - value.length} characters remaining
                    </div>
                </>
            )}
        </div>
    )
}
