import React, { type MouseEvent, type ReactNode } from 'react'

import style from './StyledButton.module.scss'

import clsx from 'clsx'

import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
import { LoadingIcon } from 'src/components/icons'
import { useReportDialogBusy } from 'src/components/feedback/dialog/DialogBusyContext'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'

const IN_PROGRESS = { en: 'In progress', no: 'Pågår' } as const

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
    /**
     * @figmaProp none — behavioral. Why the action is unavailable. Together with `disabled` the
     * button stays focusable (`aria-disabled` instead of the native attribute), ignores activation
     * and shows the reason on hover, focus and tap (disabled-states DIS-1…DIS-4). Without
     * `disabled` it has no effect.
     */
    disabledReason?: ReactNode
    /**
     * @figmaProp none — behavioral. Busy: spinner centred over the label (the label stays invisible in the layout, so the width is kept), `aria-busy`, focus kept,
     * activation ignored (disabled-states DIS-8, submit-buttons SUB-4). The start is announced politely.
     */
    loading?: boolean
    /** Language of the default busy announcement; defaults to English. */
    locale?: UiCoreLocale
    /** @figmaProp none — behavioral. Announced when `loading` starts; defaults to "In progress" in `locale`. */
    loadingAnnouncement?: string
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
    style: styleProp,
    disabled,
    disabledReason,
    loading,
    loadingAnnouncement,
    locale = 'en',
    onClick,
    ...otherProps
}: StyledButtonProps): JSX.Element => {
    // A running action keeps the dialog around it open (no Esc / backdrop / X dismissal).
    useReportDialogBusy(Boolean(loading))

    const isLarge = size === 'large' || size === 'medium'

    // setup className
    const color = error ? 'error' : 'common'

    const softDisabled = Boolean(disabled) && Boolean(disabledReason)
    const blocked = softDisabled || Boolean(loading)
    const iconSize = isLarge ? 20 : 16

    // Busy: the label and icons stay in the layout, invisible but still the accessible name, and the
    // spinner sits centred over them, so the button keeps its width and height (submit-buttons SUB-4).
    const hideWhenBusy = (node: ReactNode): ReactNode =>
        loading && node ? <span style={{ display: 'inline-flex', opacity: 0 }}>{node}</span> : node

    // preventDefault also cancels the form submit of a `type="submit"` button, including the
    // implicit submit a browser fires on Enter in a form field.
    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
        if (blocked) {
            event.preventDefault()
            return
        }
        onClick?.(event)
    }

    const button = (
        <button
            {...otherProps}
            disabled={Boolean(disabled) && !blocked}
            aria-disabled={blocked || undefined}
            aria-busy={loading ? true : otherProps['aria-busy']}
            onClick={handleClick}
            className={clsx(
                // ASMA-8210: touch readiness only. The button already owns a designed `:active`
                // (see StyledButton.module.scss), so it must not also take `.asma-pressable`'s
                // fallback opacity — that would dim the designed pressed colours on top of them.
                'asma-touch-ready',
                style['asma-ui-core-button'],
                BtnStyles[variant],
                BtnStyles[color],
                BtnStyles[size],
                className,
            )}
            // A button with a text label must fit its content: as a flex item in a tight row it would
            // otherwise shrink below the icon+label, and since the label is `overflow:hidden` + centered
            // the text clips on BOTH sides ("Apply new versions" → "ply new versic") and the icon gets
            // squeezed. flex-shrink:0 keeps text buttons at content width; icon-only buttons (no
            // children) keep the default shrink + square min-width:40px, so toolbars aren't disturbed.
            style={{
                ...(children ? { flexShrink: 0 } : {}),
                ...(loading ? { position: 'relative' } : {}),
                ...styleProp,
            }}
            ref={refLink}
            data-testid={dataTest}
        >
            {hideWhenBusy(startIcon)}
            {children && (
                <div
                    style={{
                        opacity: loading ? 0 : undefined,
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
            {hideWhenBusy(endIcon)}
            {loading && (
                <span
                    aria-hidden='true'
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <LoadingIcon width={iconSize} height={iconSize} />
                </span>
            )}
        </button>
    )

    // Keep the tooltip tree mounted even when the reason is removed, so the button retains focus.
    // An enabled button keeps the tooltip closed.
    const tooltipped = (
        <StyledTooltip
            arrow
            title={disabledReason}
            open={softDisabled ? undefined : false}
            openOnTap={softDisabled}
            persistentDescription={softDisabled}
        >
            {button}
        </StyledTooltip>
    )

    // The live region exists before `loading` turns on, otherwise screen readers miss the change. The
    // fragment is always returned, so adding the region never remounts the button.
    return (
        <>
            {tooltipped}
            {loading !== undefined && (
                <span role='status' className='sr-only'>
                    {loading ? loadingAnnouncement ?? IN_PROGRESS[locale] : ''}
                </span>
            )}
        </>
    )
}
