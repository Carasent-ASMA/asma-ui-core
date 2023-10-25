import { type FC, type ReactNode } from 'react'
import styles from './StyledInput.module.scss'
import clsx from 'clsx'

/**
 * Developer: bragari.andrei@carasent.com
 * Custom props:
 * @param description - message under input (string)
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
          error?: boolean
          notEditable?: never
          readOnly?: never
      }
    | {
          disabled?: boolean
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

export type StyledInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    size?: 'large' | 'small'
    description?: ReactNode
    startIcon?: JSX.Element
    endIcon?: JSX.Element
    dataTest?: string
    label?: ReactNode
    refLink?: React.Ref<HTMLInputElement>
} & ConditionalProps

export const StyledInput: FC<StyledInputProps> = ({
    description,
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
        : otherProps.disabled
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
                readOnly={notEditable || readOnly}
                data-test={dataTest}
            />
            <span className={`${styles['endIcon']} ${styles[typeMixin]} ${typeMixin === 'readOnly' ? 'right-0' : ''}`}>
                {endIcon}
            </span>
            <div className={`${styles['description']} ${styles[typeMixin]}`}>{description}</div>
        </div>
    )
}
