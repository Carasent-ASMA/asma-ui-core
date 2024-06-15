import { ChevronDownIcon, ChevronUpIcon, StyledButton, StyledLink, StyledWidgetTitle } from 'asma-core-ui'
import type { PropsWithChildren, ReactNode } from 'react'
import style from './StyledWidget.module.scss'
import { useState } from 'react'
import clsx from 'clsx'

export type StyledWidgetProps = {
    title: string
    icon?: ReactNode
    link?: {
        content: string
        href?: string
        onClick?: () => void
        hide?: boolean
    }
    viewMore?: {
        onClick?: () => void
        hide?: boolean
    }
}

export const StyledWidget: React.FC<PropsWithChildren<StyledWidgetProps>> = ({
    children,
    title,
    icon,
    link,
    viewMore,
}) => {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className={style['asma-core-ui-styled-widget']}>
            <div
                className={clsx(
                    style['widget-wrapper'],
                    expanded ? style['widget-expanded'] : style['widget-collapsed'],
                )}
            >
                <div className={style['widget-header']}>
                    {icon}
                    <StyledWidgetTitle>{title}</StyledWidgetTitle>
                </div>

                <div className={style['widget-content']}>{children}</div>

                <div
                    className={clsx(
                        style['widget-footer'],
                        !!viewMore && !viewMore?.hide
                            ? style['widget-footer-space-between']
                            : style['widget-footer-center'],
                    )}
                >
                    {!!viewMore && !viewMore?.hide && (
                        <StyledButton
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
                                viewMore?.onClick?.()
                            }}
                        >
                            {expanded ? 'View less' : 'View more'}
                        </StyledButton>
                    )}

                    {!!link && !link.hide && (
                        <StyledLink
                            dataTest='go-to-button'
                            className={style['widget-link']}
                            size='small'
                            href={link.href}
                            onClick={link.onClick}
                            content={link.content}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
