import React, { type ReactNode } from 'react'

import style from './StyledButton.module.scss'

import clsx from 'clsx'

export type StyledButtonType = 'contained' | 'outlined' | 'text' | 'textGray'

interface commonProps {
    /** @figmaProp none — ref */
    refLink?: React.Ref<HTMLButtonElement>
    /** @figmaProp Size = medium→"Medium" (h40, text16/24) | small→"Small" (h32, text14/20) | large→"Medium" (no distinct Figma size) */
    size?: 'large' | 'small' | 'medium'
    /** @figmaProp none — behavioral (renders inside the button; Figma "Icon left" 24/20px slot) */
    startIcon?: ReactNode
    /** @figmaProp none — behavioral (renders inside the button; Figma "Icon right" 24/20px slot) */
    endIcon?: ReactNode
    /** @figmaProp none — test hook */
    dataTest: string
}

interface variantTextGrayProps {
    /** @figmaProp Type = textGray→"Quaternary" (transparent bg, text-icon/body #49525f) */
    variant?: 'textGray'
    error?: never
}
interface variantTextWhiteProps {
    /** @figmaProp none — app-specific variant, no Figma counterpart */
    variant?: 'textWhite'
    error?: never
}
interface buttonStandartVariantsProps {
    /** @figmaProp Type = contained→"Primary (Contained)" | outlined→"Secondary (Outlined)" | text→"Tertiary" (teal text) | textGray→"Quaternary" (gray text) | textWhite→none */
    variant?:
        | 'contained'
        | 'outlined'
        | 'text'
        | 'textGray'
        | 'textWhite'
        | 'large'
        | 'small'
        | 'medium'
        | 'error'
        | 'common'
    /** @figmaProp Danger = true→"on" | false→"off" */
    error?: boolean
}

type conditionalProps = variantTextGrayProps | variantTextWhiteProps | buttonStandartVariantsProps

const BtnStyles: Record<
    'contained' | 'outlined' | 'text' | 'textGray' | 'textWhite' | 'large' | 'small' | 'medium' | 'error' | 'common',
    string | undefined
> = {
    contained: style['contained'],
    outlined: style['outlined'],
    text: style['text'],
    textGray: style['textGray'],
    textWhite: style['textWhite'],
    large: style['large'],
    small: style['small'],
    medium: style['medium'],
    error: style['error'],
    common: style['common'],
}
export type StyledButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & commonProps & conditionalProps
/**
 * Developer: daria.bogatiriov@carasent.com
 *
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#13431-18852
 * @remarks Figma "Button" component. Figma property → React prop mapping is annotated
 * per-prop with `@figmaProp` (Type→variant, Size→size, Danger→error). The Figma "State"
 * property (Enabled/Hovered/Focused/Pressed/Disabled) is derived at runtime from the
 * native button pseudo-states + the `disabled` attribute, not a prop.
 * @remarks for icon button add only startIcon prop
 * @remarks for error button no textGray variant
 *
 * Custom props:
 * @param variant -  'contained' | 'outlined' | 'text' | 'textGray'
 * @param size -  'large' | 'small' | 'medium'
 * @param startIcon - ReactNode
 * @param endIcon - ReactNode
 * @param error -  boolean
 * @param refLink -  ref to component
 * @param dataTest -  data-test tag
 */
export const StyledButton = ({
    variant = 'contained',
    className = '',
    size = 'medium',
    children,
    refLink,
    startIcon,
    endIcon,
    dataTest,
    error,
    ...otherProps
}: StyledButtonProps): JSX.Element => {
    const isLarge = size === 'large' || size === 'medium'

    // setup className
    const color = error ? 'error' : 'common'

    return (
        <button
            {...otherProps}
            className={clsx(
                style['asma-ui-core-button'],
                BtnStyles[variant],
                BtnStyles[color],
                BtnStyles[size],
                className,
            )}
            ref={refLink}
            data-testid={dataTest}
        >
            {startIcon}
            {children && (
                <div
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isLarge ? '8px' : '4px',
                        paddingLeft: isLarge ? '8px' : '4px',
                        paddingRight: isLarge ? '8px' : '4px',
                    }}
                >
                    {children}
                </div>
            )}
            {endIcon}
        </button>
    )
}
