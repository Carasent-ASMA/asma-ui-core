import React, { useEffect, useId, useRef, type ChangeEvent, type ReactNode } from 'react'
import styles from './StyledTextarea.module.scss'

export interface TextareaCommonProps {
    id?: string
    value?: string
    label?: ReactNode
    labelClassName?: string
    description?: ReactNode
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
    disabled?: boolean
    placeholder?: string
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
    error?: boolean
    errorMessage?: string
    maxLength?: number
    counter?: boolean
    refLink?: React.RefObject<HTMLTextAreaElement> | null | undefined
    counterLimit?: number
}
type TextareaConditionalProps = TextAreaActiveProps | TextAreaNotEditableProps
type StyledTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
    TextareaCommonProps &
    TextareaConditionalProps

type TextareaTypes = 'active' | 'error'
type textTypes = 'active' | 'error' | 'disabled'

/**
 * Developer: bularga.alexandru@carasent.com
 *
 * Custom props:
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

    useEffect(() => {
        if (textAreaRef.current) {
            const textArea = textAreaRef.current
            const computedStyle = window.getComputedStyle(textArea)
            const additionalBottomPadding = parseFloat(computedStyle.paddingBottom)
            textArea.style.height = 'auto'

            const rowHeight = parseFloat(computedStyle.lineHeight)
            const paddingTop = parseFloat(computedStyle.paddingTop)
            const heightWithoutPaddings = textArea.scrollHeight - paddingTop
            const rows = Math.ceil(heightWithoutPaddings / rowHeight)

            if (rows > maxRows) {
                textArea.style.height = `${rowHeight * maxRows + paddingTop + additionalBottomPadding}px`
            } else {
                textArea.style.height = `${textArea.scrollHeight + additionalBottomPadding}px`
            }
        }
    }, [textAreaRef, value, minRows, maxRows, counterEnabled])

    if (maxRows < minRows) {
        minRows = maxRows
    }

    const textareaType: TextareaTypes = error ? 'error' : 'active'

    const textType: textTypes = error ? 'error' : disabled ? 'disabled' : 'active'

    return (
        <div className={`relative flex flex-col gap-1 ${containerClassName}`} data-testid={dataTest}>
            <label htmlFor={textAreaId} className={`${styles['label']} ${styles[textType]} ${labelClassName}`}>
                {label}
            </label>
            <span id={descriptionId} className={`${styles['description']} ${styles[textType]}`}>
                {error ? errorMessage : description}
            </span>
            {variant === 'view_only' ? (
                <div className='pt-3 font-roboto text-sm font-normal text-gray-700'>{value}</div>
            ) : variant === 'not_editable' ? (
                <div className='rounded bg-gray-200 p-3 font-roboto text-sm font-normal text-gray-700'>{value}</div>
            ) : (
                <textarea
                    {...otherProps}
                    aria-describedby={`${descriptionId} ${counterId}`}
                    aria-invalid={error}
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
