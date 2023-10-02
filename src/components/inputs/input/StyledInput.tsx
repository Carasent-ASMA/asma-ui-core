import { type FC } from 'react'
import styles from './StyledInput.module.scss'
import clsx from 'clsx'

/**
 * Developer: bragari.andrei@carasent.com
 * Custom props:
 * @param descriptionMessage - message under input (string)
 * @param startIcon - icon before input (JSX.Element)
 * @param endIcon - icon after input (JSX.Element)
 * @param dataTest - data-test tag (string)
 * @param label - string
 * @param refLink -  ref to component
 * @param size -  'large' | 'small'
 * @param className - for styles (width)
 */
type ConditionalProps =
    | {
          disabled?: boolean
          error?: never
          notEditable?: never
          readOnly?: never
      }
    | {
          disabled?: never
          error?: boolean
          notEditable?: never
          readOnly?: never
      }
    | {
          disabled?: never
          error?: never
          notEditable?: boolean
          readOnly?: never
      }
    | {
          disabled?: never
          error?: never
          notEditable?: never
          readOnly?: boolean
      }

type StyledInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    size?: 'large' | 'small'
    descriptionMessage?: string
    startIcon?: JSX.Element
    endIcon?: JSX.Element
    dataTest?: string
    label?: string
    refLink?: React.Ref<HTMLInputElement>
} & ConditionalProps
export const StyledInput: FC<StyledInputProps> = ({
    descriptionMessage,
    disabled = false,
    error = false,
    label,
    refLink,
    startIcon,
    endIcon,
    type,
    readOnly,
    notEditable,
    dataTest,
    size = 'large',
    className,
    ...otherProps
}) => {
    const inputType = notEditable ? 'text' : type || 'text'

    const sizeClass = size === 'small' ? styles['small'] : ''

    const typeMixin = error
        ? 'error'
        : disabled
        ? 'disabled'
        : readOnly
        ? 'readOnly'
        : notEditable
        ? 'notEditable'
        : 'active'

    return (
        <div className={clsx('relative', className)}>
            <label htmlFor='custom-input' className={`${styles['label']} ${styles[typeMixin]}`}>
                {label}
            </label>
            <span
                className={` ${styles['startIcon']} ${styles[typeMixin]} ${typeMixin === 'readOnly' ? 'left-0' : ''}`}
            >
                {startIcon}
            </span>
            <input
                {...otherProps}
                ref={refLink}
                type={inputType}
                className={clsx(
                    styles['input'],
                    styles[typeMixin],
                    sizeClass,
                    typeMixin === 'readOnly' && startIcon && 'pl-8',
                    typeMixin === 'readOnly' && endIcon && 'pr-8',
                    startIcon && 'pl-12',
                    endIcon && 'pr-12',
                    className,
                )}
                disabled={disabled}
                readOnly={notEditable || readOnly}
                data-test={dataTest}
            />
            <span className={`${styles['endIcon']} ${styles[typeMixin]} ${typeMixin === 'readOnly' ? 'right-0' : ''}`}>
                {endIcon}
            </span>
            <div className={`${styles['description']} ${styles[typeMixin]}`}>{descriptionMessage}</div>
        </div>
    )
}
