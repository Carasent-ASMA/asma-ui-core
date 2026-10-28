import { StyledButton, StyledEmptyPage, StyledLink, StyledLoading, StyledWidgetTitle } from 'asma-ui-core'
import { useState, type PropsWithChildren, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import style from './StyledWidget.module.scss'

import ChevronDownIcon from '../icons/ChevronDownIcon'
import ChevronUpIcon from '../icons/ChevronUpIcon'


/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#36956-172116 (Design-System · "Widget")
 *
 * Widget card: `bg/widget` white, radius 8, padding 16, gap 16, DS **Container** shadow
 * (#22213326 = `0 0 4 rgba(34,33,51,.15)`). Header (title via `StyledWidgetTitle` = Section title
 * 18/28 delta-800) + content (composes aligned `StyledLoading`/`StyledEmptyPage`) + optional footer
 * (aligned `StyledButton` view-more + `StyledLink`).
 */
export interface StyledWidgetProps {
    title: string
    titleNode?: ReactNode
    icon?: ReactNode
    headerRight?: ReactNode
    headerRightClassName?: string
    link?: {
        content: string
        href?: string
        onClick?: () => void
        hide?: boolean
    }
    viewMore?: {
        viewMoreText: string
        viewLessText: string
        onClick?: () => void
        hide?: boolean
        disabled?: boolean
        /**
         * @figmaProp none — behavioral. Why "view more" is unavailable. With `disabled` the button stays
         * focusable and shows the reason on hover, focus and tap (disabled-states DIS-1…DIS-4).
         */
        disabledReason?: ReactNode
    }
    /**
     * @param {string} persistKey - Unique key to persist expanded state
     */
    persistKey?: string
    isLoading: boolean
    isEmpty: boolean
    emptyText: string
}

export const StyledWidget: React.FC<PropsWithChildren<StyledWidgetProps>> = ({
    children,
    title,
    titleNode,
    icon,
    link,
    viewMore,
    persistKey,
    isLoading,
    isEmpty,
    emptyText,
    headerRight,
    headerRightClassName,
}) => {
    const [expanded, setExpanded] = useState(() => {
        if (persistKey) {
            const val = localStorage.getItem(persistKey)
            return val === 'true' ? true : false
        }
        return false
    })

    const showLink = !!link && !link.hide
    const showViewMore = !!viewMore && !viewMore.hide

    return (
        <div className={`${style['asma-ui-core-styled-widget']} ${isEmpty ? style['empty-state'] : ''}`}>
            <div className={cn(style['widget-header-left'], 'max-xs:flex-wrap max-xs:gap-y-2')}>
                {/* The icon keeps its size and a long title wraps beside it (down to its longest word),
                 * instead of the title's `fit-content` squeezing the icon to nothing. */}
                {icon && <span className='flex shrink-0'>{icon}</span>}
                {titleNode ?? <StyledWidgetTitle className='min-w-min'>{title}</StyledWidgetTitle>}
                <div
                    className={cn(
                        style['widget-header-right'],
                        'max-xs:flex-wrap max-xs:gap-y-2',
                        headerRightClassName,
                    )}
                >
                    {headerRight}
                </div>
            </div>

            <div className={style['widget-content']}>
                <>
                    {children}

                    <StyledLoading isLoading={isLoading} />

                    <StyledEmptyPage isEmpty={isEmpty} emptyText={emptyText} />
                </>
            </div>

            {showViewMore && (
                <div className={cn(style['widget-footer'], 'max-xs:flex-wrap max-xs:gap-y-2')}>
                    {!viewMore.hide ? (
                        <StyledButton
                            disabled={viewMore.disabled}
                            disabledReason={viewMore.disabledReason}
                            dataTest='view-more'
                            variant='text'
                            endIcon={
                                expanded ? (
                                    <ChevronUpIcon width={20} height={20} />
                                ) : (
                                    <ChevronDownIcon width={20} height={20} />
                                )
                            }
                            onClick={() => {
                                setExpanded(!expanded)
                                if (persistKey) {
                                    localStorage.setItem(persistKey, String(!expanded))
                                }
                                viewMore.onClick?.()
                            }}
                        >
                            {expanded ? viewMore.viewLessText : viewMore.viewMoreText}
                        </StyledButton>
                    ) : (
                        <div />
                    )}

                    {showLink ? (
                        <StyledLink
                            dataTest='go-to-button'
                            className={style['widget-link']}
                            size='large'
                            href={link.href}
                            onClick={link.onClick}
                            content={link.content}
                        />
                    ) : (
                        <div />
                    )}
                </div>
            )}
        </div>
    )
}
