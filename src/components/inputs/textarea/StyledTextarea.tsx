import React, { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useAutosizeTextArea } from './useAutosizeTextArea'
import styles from './StyledTextarea.module.scss'

type TextareaCommonProps = {
    id?: string
    value?: string
    label?: ReactNode
    labelClassName?: string
    description?: ReactNode
    containerClassName?: string
    className?: string
    dataTest?: string
}

type TextAreaNotEditableProps = {
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

type TextAreaActiveProps = {
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
    const textAreaRef = refLink ? refLink : textAreaInnerRef
    const counterEnabled = !!(counter && counterLimit)

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useAutosizeTextArea(textAreaRef.current, value, minRows, maxRows, mounted, counterEnabled)

    if (maxRows < minRows) {
        minRows = maxRows
    }

    const [charsCount, setCharsCount] = useState<number>(value.length)

    useEffect(() => {
        setCharsCount(value.length)
    }, [value])

    type TextareaTypes = 'active' | 'error'
    const textareaType: TextareaTypes = error ? 'error' : 'active'

    type textTypes = 'active' | 'error' | 'disabled'
    const textType: textTypes = error ? 'error' : disabled ? 'disabled' : 'active'

    return (
        <div className={`flex flex-col gap-1 relative ${containerClassName}`} data-test={dataTest}>
            <label htmlFor={id} className={`${styles['label']} ${styles[textType]} ${labelClassName}`}>
                {label}
            </label>
            <span className={`${styles['description']} ${styles[textType]}`}>{error ? errorMessage : description}</span>
            {variant === 'view_only' ? (
                <div className='font-roboto text-sm font-normal pt-3 text-gray-700'>{value}</div>
            ) : variant === 'not_editable' ? (
                <div className='font-roboto text-sm font-normal rounded p-3 bg-gray-200 text-gray-700'>{value}</div>
            ) : (
                <textarea
                    {...otherProps}
                    id={id}
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
                <div className='flex justify-end absolute bottom-3 right-3 text-[10px] font-roboto h-[15px] pointer-events-none'>
                    {charsCount}/{counterLimit}
                </div>
            )}
        </div>
    )
}
