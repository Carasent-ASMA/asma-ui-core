import { useCallback, useContext, useEffect, useId, useLayoutEffect, useState, type ReactNode } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
import { DotsVerticalIcon } from 'src/components/icons/dots-vertical-icon'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledMenu } from 'src/components/navigation/menu/StyledMenu'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { cn } from 'src/helpers/cn'
import type { CardCheckbox, CardLabels, CardMenu } from './Card.types'
import { CardContext } from './cardModel'

// ─── Body parts ─────────────────────────────────────────────────────────────

interface CardControlProps {
    children: ReactNode
    className?: string
}

/**
 * Lifts a control above the card's stretched link, so a tap on it never opens the card, and gives
 * it at least a 40 × 40 CSS px hit area that includes its visible label (CARD-5, CARD-16). Text in
 * it stays selectable, so a value users copy belongs here too. Any `CardControl` in a card's body
 * makes the card partially clickable.
 *
 * @see asma-modules/_docs/ux/components/component-card.md:140 — CARD-5
 */
export const CardControl = ({ children, className }: CardControlProps): JSX.Element => {
    const card = useContext(CardContext)

    useLayoutEffect(() => card?.registerControl(), [card])

    return (
        <div
            data-card-control=''
            className={cn('relative z-1 inline-flex min-h-10 max-w-full min-w-10 items-center self-start select-text', className)}
        >
            {children}
        </div>
    )
}

/**
 * Highlight tag: Design System tag, 11 px, semibold, uppercase through CSS so screen readers do not
 * spell it out. Sized in rem with no fixed height, so larger text and spacing never clip it (CARD-10, Q10).
 */
export const CardTag = ({ children }: { children: string }): JSX.Element => (
    <span className='bg-success-300 inline-flex min-h-4 items-center rounded-[0.1875rem] px-1.5 text-[0.6875rem]/3 font-semibold tracking-[0.034375rem] text-black uppercase'>
        {children}
    </span>
)

// ─── Checkbox ───────────────────────────────────────────────────────────────

interface CardCheckboxControlProps {
    checkbox: CardCheckbox
    titleText: string
    labels: CardLabels
    dataTest: string
}

/** Selection checkbox named "Velg «title»"; the visible "Velg" sits inside its hit area (CARD-5, CARD-13). */
export const CardCheckboxControl = ({ checkbox, titleText, labels, dataTest }: CardCheckboxControlProps): JSX.Element => {
    const inputId = useId()
    const isUnavailable = Boolean(checkbox.disabledReason)

    // The visible "Velg" is a second label of the same input, so it sits inside the hit area (CARD-5).
    const control = (
        <span className='inline-flex items-center'>
            <StyledCheckbox
                dataTest={`${dataTest}-checkbox`}
                id={inputId}
                checked={checkbox.checked}
                readOnly={isUnavailable}
                aria-disabled={isUnavailable || undefined}
                aria-label={labels.selectFor(titleText)}
                size={checkbox.size}
                onChange={(_event, checked) => checkbox.onChange(checked)}
            />
            {!checkbox.hideLabel && (
                <label htmlFor={inputId} className='text-delta-700 cursor-pointer pr-2 text-base/6 select-none'>
                    {labels.select}
                </label>
            )}
        </span>
    )

    return (
        <CardControl>
            {isUnavailable ? (
                <StyledTooltip title={checkbox.disabledReason} openOnTap persistentDescription>
                    {control}
                </StyledTooltip>
            ) : (
                control
            )}
        </CardControl>
    )
}

// ─── ⋮ menu ─────────────────────────────────────────────────────────────────

const MAX_MENU_ACTIONS = 7

interface CardMenuControlProps {
    menu: CardMenu
    titleText: string
    labels: CardLabels
    dataTest: string
}

/**
 * ⋮ trigger. With `actions` it opens the design-system menu, as the Workspaces cards do; with
 * `render` the app's own popover. Focus returns to the trigger when it closes (CARD-14).
 *
 * @see asma-modules/_docs/ux/components/component-card.md:188 — CARD-14
 */
export const CardMenuControl = ({ menu, titleText, labels, dataTest }: CardMenuControlProps): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const open = Boolean(anchorEl)
    const close = useCallback(() => setAnchorEl(null), [])
    const actionCount = menu.actions?.length ?? 0

    useEffect(() => {
        if (import.meta.env.DEV && actionCount > MAX_MENU_ACTIONS) console.warn('Card menu: at most seven actions (LIST-2).')
    }, [actionCount])

    return (
        <CardControl className='ml-auto'>
            <StyledButton
                dataTest={`${dataTest}-menu-trigger`}
                type='button'
                variant='textGray'
                startIcon={<DotsVerticalIcon width={24} height={24} />}
                // 1 + 7 + 24 + 7 + 1 (border, padding, icon): the 40 × 40 icon button.
                className='px-[7px]'
                aria-label={labels.moreActionsFor(titleText)}
                aria-haspopup={menu.actions ? 'menu' : 'dialog'}
                aria-expanded={open}
                onClick={(event) => setAnchorEl(open ? null : event.currentTarget)}
            />
            {menu.render ? (
                menu.render({ anchorEl, open, close })
            ) : (
                <StyledMenu
                    open={open}
                    anchorEl={anchorEl}
                    onClose={close}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    {menu.actions.map((action, index) => (
                        <StyledMenuItem
                            key={action.label}
                            data-testid={`${dataTest}-menu-action-${index}`}
                            className={cn(action.icon && 'gap-2', action.danger && 'text-error-500')}
                            disabled={Boolean(action.disabledReason)}
                            disabledReason={action.disabledReason}
                            onClick={() => {
                                // Close first: an action that opens a dialog must not find the menu still open.
                                close()
                                action.onSelect()
                            }}
                        >
                            {action.icon}
                            {action.label}
                        </StyledMenuItem>
                    ))}
                </StyledMenu>
            )}
        </CardControl>
    )
}
