import { Fragment, isValidElement, useCallback, useContext, useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { StyledBadge } from 'src/components/data-display/badge/StyledBadge'
import { ChevronRightIcon } from 'src/components/icons/chevron-right-icon'
import { VisibilityOutlineIcon } from 'src/components/icons/visibility-outline-icon'
import { WarningAmberOutlineIcon } from 'src/components/icons/warning-icon'
import { cn } from 'src/helpers/cn'
import { CARD_LABELS, type CardCheckbox, type CardHeadingLevel, type CardLabels, type CardLinkRenderProps, type CardModel, type CardOpen, type CardProps } from './Card.types'
import { CardContext, CardListItemContext, resolveCardModel, usePressedHold, type CardContextValue } from './cardModel'
import { CardCheckboxControl, CardControl, CardMenuControl, CardTag } from './CardParts'
import styles from './Card.module.scss'

interface CardPartIds {
    title: string
    cta: string
    type: string
    status: string
    unread: string
}

// ─── Header ─────────────────────────────────────────────────────────────────

interface UnreadMarkerProps {
    unread: NonNullable<CardProps['unread']>
    labels: CardLabels
    id: string
    dataTest: string
}

const UnreadMarker = ({ unread, labels, id, dataTest }: UnreadMarkerProps): JSX.Element => {
    const isLabelVisible = typeof unread === 'object' && unread.visibleLabel

    // The description reads a hidden normal-case copy: Chrome exposes CSS `uppercase` in the
    // accessible text, and screen readers may spell out "ULEST" (CARD-10).
    return (
        <span className='inline-flex items-center gap-1'>
            <StyledBadge dataTest={`${dataTest}-unread`} variant='dot' purpose='unread' aria-hidden='true' />
            <span id={id} hidden>
                {labels.unread}
            </span>
            {isLabelVisible && (
                <span aria-hidden='true' className='text-gama-600 text-[0.6875rem]/3 font-semibold tracking-[0.034375rem] uppercase'>
                    {labels.unread}
                </span>
            )}
        </span>
    )
}

interface CardHeaderTopRowProps extends Pick<CardProps, 'unread' | 'tags' | 'menu' | 'dataTest'> {
    checkbox?: CardCheckbox
    titleText: string
    labels: CardLabels
    unreadId: string
}

/**
 * First row: checkbox, unread, tags, ⋮ at the end. Only what applies, always in this order; the
 * card leaves out an empty row; nothing is truncated and the row wraps (CARD-7).
 *
 * @see asma-modules/_docs/ux/components/component-card.md:152 — CARD-7
 */
const CardHeaderTopRow = ({ checkbox, unread, tags, menu, titleText, labels, unreadId, dataTest }: CardHeaderTopRowProps): JSX.Element => {
    // A checkbox or ⋮ brings its own 40 × 40 hit area; the unread marker and tags alone get the
    // body's inset instead (Figma "Top": 12 px start, 8 px top, 4 px bottom).
    return (
        <div className={cn('flex flex-wrap items-center gap-2', !checkbox && 'pl-3', !checkbox && !menu && 'pt-2 pb-1')}>
            {checkbox && <CardCheckboxControl checkbox={checkbox} titleText={titleText} labels={labels} dataTest={dataTest} />}
            {unread && <UnreadMarker unread={unread} labels={labels} id={unreadId} dataTest={dataTest} />}
            {Boolean(tags?.length) && (
                <span className={cn('inline-flex flex-wrap gap-2', Boolean(checkbox ?? unread) && 'pl-1')}>
                    {tags?.map((tag, index) => (
                        // Tags are a fixed, ordered set; a string may repeat, so the index is the key.
                        <Fragment key={index}>{typeof tag === 'string' ? <CardTag>{tag}</CardTag> : tag}</Fragment>
                    ))}
                </span>
            )}
            {menu && <CardMenuControl menu={menu} titleText={titleText} labels={labels} dataTest={dataTest} />}
        </div>
    )
}

interface CardHeaderTypeRowProps extends Pick<CardProps, 'type' | 'status' | 'overdue'> {
    ids: CardPartIds
    /** A disabled card draws its status in the helper colour (Figma 7334:33933). */
    isDisabled: boolean
    /** Below a first header row the type row sits closer to it (Figma "Read=off"). */
    hasTopRow: boolean
}

/** Second row: type at the start, status or overdue at the end; it wraps, nothing is cut (CARD-7, CARD-10). */
const CardHeaderTypeRow = ({ type, status, overdue, ids, hasTopRow, isDisabled }: CardHeaderTypeRowProps): JSX.Element | null => {
    if (!type && !status && !overdue) return null

    return (
        <div className={cn('flex flex-wrap items-start justify-between gap-x-4 gap-y-2', !hasTopRow && 'pt-2')}>
            {type && (
                <span
                    id={ids.type}
                    className={cn(
                        'inline-flex min-w-0 items-center wrap-anywhere',
                        type.size === 'body' ? 'gap-1 text-base/6' : 'gap-[3px] text-sm/5',
                        overdue && 'text-warning-800',
                    )}
                    style={{ color: overdue ? undefined : type.color }}
                >
                    {type.icon && (
                        <span
                            aria-hidden='true'
                            className={cn(
                                'inline-flex items-center justify-center',
                                type.size === 'body' ? 'size-5 [&>svg]:size-5' : 'size-4 [&>svg]:size-4',
                            )}
                        >
                            {type.icon}
                        </span>
                    )}
                    <span data-card-type-label='' className='min-w-0'>
                        {type.label}
                    </span>
                </span>
            )}
            <span
                id={ids.status}
                className={cn(
                    'ml-auto inline-flex min-w-0 flex-wrap items-center justify-end gap-x-2 text-right text-sm/5 wrap-anywhere',
                    isDisabled ? 'text-delta-600' : 'text-delta-700',
                )}
            >
                {status && (
                    <span className='inline-flex min-w-0 items-center gap-2'>
                        {status.label}
                        {status.squareColor && <span aria-hidden='true' className='size-3 shrink-0 rounded-xs' style={{ backgroundColor: status.squareColor }} />}
                    </span>
                )}
                {overdue && (
                    <span className='text-warning-700 inline-flex min-w-0 items-center gap-2'>
                        {overdue.label}
                        <WarningAmberOutlineIcon aria-hidden='true' className='size-5 shrink-0' />
                    </span>
                )}
            </span>
        </div>
    )
}

// ─── Title ──────────────────────────────────────────────────────────────────

interface CardTitleProps {
    title: ReactNode
    level: CardHeadingLevel
    model: CardModel
    open?: CardOpen
    titleId: string
    labelledBy: string
    describedBy: string | undefined
    selected: boolean
    disabled: boolean
    titleChevron: boolean
    titleClamp?: 1 | 2
    className?: string
}

// One line uses `text-overflow`, which cuts at the edge, so the chevron sits right after the
// ellipsis; `line-clamp` cuts after the last whole word and leaves a gap before it (CARD-4, CARD-8).
const CLAMP_CLASS = { 1: 'min-w-0 truncate', 2: 'line-clamp-2 [overflow-wrap:anywhere]' } as const

/**
 * The title chevron sits inline after the last word and wraps with it, joined by a word joiner (CARD-4).
 * Under a clamp it moves beside the clamped text, so the cut never hides it.
 */
const TitleChevron = (): JSX.Element => (
    <span aria-hidden='true' data-card-chevron='' className='inline-block align-top whitespace-nowrap'>
        {'⁠'}
        <ChevronRightIcon className='-my-px inline-block size-6 align-top' />
    </span>
)

const TitleText = ({ title, titleId, titleClamp, titleChevron }: Pick<CardTitleProps, 'title' | 'titleId' | 'titleClamp' | 'titleChevron'>): JSX.Element => {
    if (titleClamp) {
        return (
            <span className='inline-flex max-w-full items-start'>
                <span id={titleId} className={CLAMP_CLASS[titleClamp]}>
                    {title}
                </span>
                {titleChevron && <TitleChevron />}
            </span>
        )
    }

    return (
        <>
            <span id={titleId} className='wrap-anywhere'>
                {title}
            </span>
            {titleChevron && <TitleChevron />}
        </>
    )
}

/**
 * The card's one opening element: a link for a page, a `<button aria-haspopup="dialog">` for a
 * dialog, inside a real heading. Its `::after` stretches over the card (CARD-3). A static card
 * renders the heading text only.
 *
 * @see asma-modules/_docs/ux/components/component-card.md:128 — CARD-3
 */
const CardTitle = ({ level, model, open, labelledBy, describedBy, selected, disabled, className, ...text }: CardTitleProps): JSX.Element => {
    const Heading = `h${level}` as const
    const headingClass = cn('text-delta-800 m-0 min-w-0 text-base/6 font-semibold', className)

    if (model === 'static' || !open) {
        return (
            <Heading className={headingClass} data-card-title=''>
                <TitleText {...text} titleChevron={false} titleClamp={undefined} />
            </Heading>
        )
    }

    const shared = {
        className: styles['link'] ?? '',
        'aria-labelledby': labelledBy,
        'aria-describedby': describedBy,
        'aria-current': selected ? ('true' as const) : undefined,
        'data-card-link': '' as const,
        children: <TitleText {...text} />,
    }

    // Disabled: still found and focused, but nothing to follow or run (DIS-3, DIS-4).
    if (disabled) {
        return (
            <Heading className={headingClass} data-card-title=''>
                {'onOpen' in open ? (
                    <button type='button' aria-haspopup='dialog' aria-disabled='true' {...shared} />
                ) : (
                    <a role='link' tabIndex={0} aria-disabled='true' {...shared}>
                        {shared.children}
                    </a>
                )}
            </Heading>
        )
    }

    if ('onOpen' in open) {
        return (
            <Heading className={headingClass} data-card-title=''>
                <button type='button' aria-haspopup='dialog' onClick={open.onOpen} {...shared} />
            </Heading>
        )
    }

    const linkProps: CardLinkRenderProps = { ...shared, href: open.href, target: open.target, onClick: open.onClick }

    return (
        <Heading className={headingClass} data-card-title=''>
            {open.renderLink ? (
                open.renderLink(linkProps)
            ) : (
                <a {...linkProps}>{linkProps.children}</a>
            )}
        </Heading>
    )
}

// ─── Footer ─────────────────────────────────────────────────────────────────

interface CardFooterProps {
    ctaContent?: ReactNode
    ctaId: string
    selected: boolean
    overdue: boolean
    footerAction?: ReactNode
    /** A real button in the CTA's place (`ctaAction`); it replaces the CTA label. */
    ctaAction?: ReactNode
    labels: CardLabels
    className?: string
}

const CUE_CLASS = 'inline-flex items-center pb-2 text-base font-semibold leading-6'

/**
 * Call-to-action label, shown when the app passes one (any product), its content passed by the app: not a
 * button, not focusable, no hover of its own. On a fully clickable card it sits under the stretched link, so
 * a tap on it opens the item. The heading alone names the link (Figma note 5021:142371).
 * While the card is selected, "Vises nå" takes its place (CARD-11, Figma 5981:158778).
 *
 * @see asma-modules/_docs/ux/components/component-card.md:134 — CARD-4
 */
const OpenCue = ({ ctaContent, ctaId, selected, overdue, labels }: Omit<CardFooterProps, 'footerAction' | 'ctaAction' | 'className'>): JSX.Element | null => {
    if (selected) {
        // gama-500 as Figma draws it, like the CTA it replaces: about 4.4:1 on the selected tint, the
        // same accepted Q14 risk as the CTA on hover and selected (user decision, 2026-11-02).
        return (
            <span aria-hidden='true' data-card-viewing-now='' className={cn(CUE_CLASS, 'gap-1 pr-3', overdue ? 'text-warning-800' : 'text-gama-500')}>
                <VisibilityOutlineIcon className='size-6' />
                {labels.viewingNow}
            </span>
        )
    }

    if (ctaContent === undefined) return null

    return (
        <span id={ctaId} aria-hidden='true' className={cn(CUE_CLASS, 'pr-1', overdue ? 'text-warning-800' : 'text-gama-500')}>
            {ctaContent}
        </span>
    )
}

/** Footer buttons start the footer at the leading edge; the CTA (label or button, e.g. "View details") sits at its end (CARD-12). */
const CardFooter = ({ footerAction, ctaAction, className, ...cue }: CardFooterProps): JSX.Element | null => {
    const hasCue = cue.selected || cue.ctaContent !== undefined || Boolean(ctaAction)
    if (!hasCue && !footerAction) return null

    return (
        // `mt-auto`: in a row of equally tall cards (CardList grid) the footer stays at the bottom.
        // `items-end`: the CTA's 8px bottom padding then puts its text on the line of a 40px button's text.
        <div className={cn('mt-auto flex flex-wrap items-end gap-x-4 pl-3', className)}>
            {footerAction && <CardControl className='gap-x-4'>{footerAction}</CardControl>}
            <div className='ml-auto flex flex-wrap items-end justify-end gap-x-4'>
                {ctaAction && !cue.selected ? <CardControl>{ctaAction}</CardControl> : <OpenCue {...cue} />}
            </div>
        </div>
    )
}

// ─── Card ───────────────────────────────────────────────────────────────────

/**
 * The text a title shows, read from its strings and numbers, so a title such as `<>{icon}{name}</>`
 * needs no `titleText`. A component that renders its text itself contributes nothing.
 */
const plainTextOf = (node: ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(plainTextOf).join('')
    if (isValidElement<{ children?: ReactNode }>(node)) return plainTextOf(node.props.children)
    return ''
}

const joinIds = (ids: (string | false | undefined)[]): string | undefined => {
    const present = ids.filter(Boolean)
    return present.length ? present.join(' ') : undefined
}

const useControlCount = (): [number, () => () => void] => {
    const [count, setCount] = useState(0)
    const register = useCallback(() => {
        setCount((value) => value + 1)
        return () => setCount((value) => value - 1)
    }, [])
    return [count, register]
}

interface ContractMisuse {
    missingTitleText: boolean
    staticWithControls: boolean
}

const useContractWarnings = ({ missingTitleText, staticWithControls }: ContractMisuse): void => {
    useEffect(() => {
        if (!import.meta.env.DEV) return
        if (missingTitleText) console.warn('Card: the title shows no plain text; pass `titleText`, so controls can name their card (CARD-5).')
        if (staticWithControls) {
            console.warn('Card: a card that opens nothing but holds controls has no tappable body; prefer a section or panel (CARD-2).')
        }
    }, [missingTitleText, staticWithControls])
}

/**
 * Shared Card shell (ASMA-8318): one base for every card type. Header and footer parts are fixed and
 * opt-in, the body is `children`, and the interaction model follows from the props (CARD-1, CARD-2).
 *
 * @see asma-modules/_docs/ux/components/component-card.md:101 — §3 Anatomy, §4 Interaction models
 * @see asma-modules/_docs/frontend/plans/2026-10-30-17-25-plan-asma-ui-core-card-component.md — plan
 */
export const Card = (props: CardProps): JSX.Element => {
    const { title, titleText: titleTextProp, open, cta, titleChevron, overdue, accentColor, dataTest } = props
    const listItem = useContext(CardListItemContext)
    const labels: CardLabels = { ...CARD_LABELS[props.locale ?? listItem.locale ?? 'en'], ...props.labels }
    const checkbox = props.checkbox ?? listItem.checkbox
    const headingLevel = props.headingLevel ?? listItem.headingLevel ?? 3
    const titleText = titleTextProp ?? plainTextOf(title).trim()

    const [bodyControlCount, registerControl] = useControlCount()
    const controls = {
        checkbox: Boolean(checkbox),
        menu: Boolean(props.menu),
        footerAction: Boolean(props.footerAction),
        ctaAction: Boolean(props.ctaAction),
    }
    const model = resolveCardModel({ open, readOnly: props.readOnly, ...controls }, bodyControlCount)
    const isStatic = model === 'static'
    const isDisabled = Boolean(props.disabled) && !isStatic
    const selected = Boolean(props.selected) && !isStatic && !isDisabled
    const { isPressed, handlers } = usePressedHold()

    useContractWarnings({
        missingTitleText: !titleText,
        staticWithControls: isStatic && Object.values(controls).some(Boolean),
    })

    const baseId = useId()
    const ids: CardPartIds = {
        title: `${baseId}-title`,
        cta: `${baseId}-cta`,
        type: `${baseId}-type`,
        status: `${baseId}-status`,
        unread: `${baseId}-unread`,
    }
    // A disabled card opens nothing, so it shows no cue (Figma draws one only on Module, a design slip).
    const isSwitchedOff = isStatic || isDisabled
    const ctaAction = isSwitchedOff ? undefined : props.ctaAction
    const ctaContent = isSwitchedOff || ctaAction || cta === null || cta === false ? undefined : cta
    // The link covers the whole card when it is the only target, or when a CTA label says the card opens;
    // a partially clickable card without one (or with a CTA button) opens from its title row only (Figma 5021:142373).
    const hitArea = model === 'full' || ctaContent !== undefined ? 'card' : 'title'
    const describedBy = joinIds([
        props.type && ids.type,
        (Boolean(props.status) || Boolean(overdue)) && ids.status,
        props.unread && ids.unread,
    ])

    const { withTitle } = labels
    const context = useMemo<CardContextValue>(
        () => ({ titleText, composeName: (label) => withTitle(label, titleText), registerControl }),
        [titleText, withTitle, registerControl],
    )

    const hasAccent = Boolean(accentColor) && !overdue
    // A disabled card's leading edge is grey whatever its type (Figma 7334:33933).
    const style = hasAccent ? ({ '--card-accent': isDisabled ? 'var(--colors-delta-300)' : accentColor } as CSSProperties) : undefined
    const hasTopRow = [checkbox, props.unread, props.tags?.length, props.menu].some(Boolean)

    return (
        <CardContext.Provider value={context}>
            <div
                className={cn(styles['card'], props.className, props.classes?.root)}
                data-testid={dataTest}
                data-model={model}
                data-hit-area={isStatic ? undefined : hitArea}
                data-accent={hasAccent ? '' : undefined}
                data-selected={selected ? '' : undefined}
                data-disabled={isDisabled ? '' : undefined}
                data-overdue={overdue ? '' : undefined}
                data-pressed={isPressed && !isStatic && !isDisabled ? '' : undefined}
                style={style}
                {...(isStatic || isDisabled ? {} : handlers)}
            >
                {hasTopRow && (
                    <CardHeaderTopRow
                        checkbox={checkbox}
                        unread={props.unread}
                        tags={props.tags}
                        menu={props.menu}
                        titleText={titleText}
                        labels={labels}
                        unreadId={ids.unread}
                        dataTest={dataTest}
                    />
                )}
                <div className={cn('flex flex-col gap-2 px-3 py-1', props.classes?.body)}>
                    <CardHeaderTypeRow type={props.type} status={props.status} overdue={overdue} ids={ids} hasTopRow={hasTopRow} isDisabled={isDisabled} />
                    <div className='flex flex-wrap items-start gap-2'>
                        <div className='flex min-w-[min(12rem,100%)] flex-[1_1_12rem] flex-col'>
                            <div data-card-title-row='' className='flex items-start gap-1'>
                                <CardTitle
                                    title={title}
                                    level={headingLevel}
                                    model={model}
                                    open={open}
                                    titleId={ids.title}
                                    labelledBy={ids.title}
                                    describedBy={describedBy}
                                    selected={selected}
                                    disabled={isDisabled}
                                    titleChevron={Boolean(titleChevron) && !isStatic}
                                    titleClamp={props.titleClamp}
                                    className={props.classes?.title}
                                />
                            </div>
                            {props.subtitle && (
                                <div className='text-delta-700 text-base/6 wrap-anywhere'>{props.subtitle}</div>
                            )}
                        </div>
                        {props.media && <div className='shrink-0'>{props.media}</div>}
                    </div>
                    {props.children}
                </div>
                <CardFooter
                    ctaContent={ctaContent}
                    ctaId={ids.cta}
                    selected={selected}
                    overdue={Boolean(overdue)}
                    footerAction={isSwitchedOff ? undefined : props.footerAction}
                    ctaAction={ctaAction}
                    labels={labels}
                    className={props.classes?.footer}
                />
            </div>
        </CardContext.Provider>
    )
}
