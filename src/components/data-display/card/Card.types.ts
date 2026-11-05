import type { MouseEvent, ReactElement, ReactNode } from 'react'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'

/** Interaction model of a card. Derived from its props, never passed in (CARD-2). */
export type CardModel = 'full' | 'partial' | 'static'

export type CardHeadingLevel = 2 | 3 | 4 | 5 | 6

/** Props the shell puts on the opening element when an app renders its own router link. */
export interface CardLinkRenderProps {
    href: string
    target?: string
    className: string
    'aria-labelledby': string
    'aria-describedby': string | undefined
    'aria-current': 'true' | undefined
    'data-card-link': ''
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
    children: ReactNode
}

/** A page destination: a real link, so new tab, copy link and back all work (CARD-3). */
export interface CardOpenLink {
    href: string
    target?: string
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
    /** Render the app's router link (e.g. react-router `Link`) instead of a native `<a>`. Spread every prop. */
    renderLink?: (props: CardLinkRenderProps) => ReactElement
}

/** A dialog or sheet on the same page: a `<button aria-haspopup="dialog">` in the heading (CARD-3). */
export interface CardOpenDialog {
    onOpen: () => void
}

export type CardOpen = CardOpenLink | CardOpenDialog

/** One item of the ⋮ menu, drawn as a `StyledMenuItem` (as the Workspaces cards do). */
export interface CardMenuAction {
    label: string
    onSelect: () => void
    icon?: ReactNode
    /** A destructive action, such as Delete: drawn in the error colour. */
    danger?: boolean
    /** Keeps the action visible but unavailable, and says why (HOD-4, DIS-4). */
    disabledReason?: string
}

/** What `menu.render` gets to draw the app's own popover, anchored to the card's ⋮ button. */
export interface CardMenuRenderProps {
    anchorEl: HTMLElement | null
    open: boolean
    close: () => void
}

/**
 * The ⋮ menu. The card always draws the ⋮ button (40 × 40, named "Flere handlinger for «title»").
 * `actions`: the card draws the design-system menu (`StyledMenu`), at most seven items.
 * `render`: the app draws its own popover instead, anchored to the button.
 */
export type CardMenu =
    | { actions: CardMenuAction[]; render?: never }
    | { render: (popover: CardMenuRenderProps) => ReactNode; actions?: never }

export interface CardCheckbox {
    checked: boolean
    onChange: (checked: boolean) => void
    /** Disables the checkbox and shows why on hover, focus and tap (DIS-4). */
    disabledReason?: string
    /** Hides the visible "Velg"; the name stays "Velg «title»". The contract asks for the label (CARD-5). */
    hideLabel?: boolean
    size?: 'small' | 'medium'
}

export interface CardType {
    label: string
    icon?: ReactNode
    /** Text colour of the type label. Decoration only; check contrast for every state (CARD-10). */
    color?: string
    /** `helper`: 14 px word, 16 px icon (default). `body`: 16 px word, 20 px icon, as Figma draws Module. */
    size?: 'helper' | 'body'
}

export interface CardStatus {
    label: string
    /** Colour of the decorative square beside the status word. */
    squareColor?: string
}

/**
 * Shared Card shell (ASMA-8318). Header and footer parts are fixed; the body is `children`.
 * Every part is opt-in: a part that is not passed is absent, never left empty (CARD-7).
 *
 * @see asma-modules/_docs/ux/components/component-card.md:101 — §3 Anatomy
 * @see asma-modules/_docs/frontend/plans/2026-10-30-17-25-plan-asma-ui-core-card-component.md — §1.3 API
 */
export interface CardProps {
    /** The item's name. Rendered as a heading that wraps in full (CARD-8). */
    title: ReactNode
    /** Plain-text title for control names. Read from `title` by default; pass it only when a component inside `title` renders the text itself. */
    titleText?: string
    /** Heading level of the title, one below the section heading above the cards (CARD-8). Defaults to the `CardList`'s `cardHeadingLevel`, else `3`. */
    headingLevel?: CardHeadingLevel
    /** What the card opens. Without it the card is static. */
    open?: CardOpen
    /**
     * Read-only (static): the card only shows the item. No link, no CTA, no footer buttons, no hover, not in
     * the tab order (CARD-6). A card without `open` is read-only as well.
     */
    readOnly?: boolean
    /** Cut the title to N lines with CSS. Only for screens recorded in the truncation pattern §8; never in Ad Voca. */
    titleClamp?: 1 | 2

    checkbox?: CardCheckbox
    /** Badge Dot. `{ visibleLabel: true }` also shows the "Ulest" word next to it. */
    unread?: boolean | { visibleLabel: boolean }
    /** Highlight tags: a string becomes the design-system tag (`CardTag`); pass an element for your own. */
    tags?: ReactNode[]
    menu?: CardMenu

    type?: CardType
    status?: CardStatus
    /** Overdue words, e.g. "Forfalt • 4 dager". See `getOverdueDays`. */
    overdue?: { label: string }

    /** Line under the title in the title column, e.g. the pathway name (§3 Body). */
    subtitle?: ReactNode
    /** Image beside the title and subtitle; it comes after the title in the DOM (CARD-9). */
    media?: ReactNode

    /**
     * Footer call-to-action label, in any product: shown when passed, absent when not. Passed whole by the
     * app: its word and the chevron, e.g.
     * `<>Åpne<ChevronRightIcon className='h-6 w-6' /></>`. The card shows it as a label, not a button: not
     * focusable, no hover of its own, not part of the link's name (the heading names it), gama-500 (warning-800 when overdue)
     * (CARD-4). Pass text and icons only, never a control.
     */
    cta?: ReactNode
    /**
     * A real button in the CTA's place at the footer end, instead of the `cta` label (Figma `5021:142351`,
     * "button"), e.g. `<StyledButton variant='text' endIcon={<ChevronRightIcon />}>Open</StyledButton>`, or a
     * "View details" button that opens the app's own popover. Name it with `useCardContext().composeName`.
     * It runs its own action, has its own tab stop and makes the card partially clickable, opening from its
     * title row only; when passed, `cta` is not shown. Hidden on read-only and disabled cards, and replaced by "Vises nå" while selected.
     */
    ctaAction?: ReactNode
    /** Chevron right after the title text, inside the link. Independent of `cta`. */
    titleChevron?: boolean
    /**
     * Footer button(s) at the start of the footer, e.g. "Signer". Not limited by the card; keep the
     * footer to two actions in total (CARD-12) and put the rest in the ⋮ menu.
     */
    footerAction?: ReactNode

    /** The item the user is viewing now: `aria-current` and a visible "Vises nå" label (CARD-11). */
    selected?: boolean
    /**
     * The item exists but cannot be opened now, e.g. a module scheduled for later (Figma `7334:33933`). It
     * opens nothing and shows no CTA and no footer buttons: grey fill and leading edge, the not-allowed
     * cursor, no hover or pressed look. Its link stays in the tab order as `aria-disabled="true"` with the focus ring (DIS-3).
     * Say why in the status, e.g. "Available later", and when in the body (DIS-1). Ignored on a read-only card.
     */
    disabled?: boolean
    /** Leading-edge colour. Decoration only. */
    accentColor?: string
    /** Language of the built-in strings ("Viewing now", control names). Defaults to the `CardList`'s, else `en`, as in the rest of ui-core. */
    locale?: UiCoreLocale
    /** Override single strings on top of `locale`. */
    labels?: Partial<CardLabels>
    /** Classes on the card root. */
    className?: string
    /**
     * Classes on the parts the card draws: `root` the whole card (edge, size, radius, …), `title` the heading,
     * `body` the body column (title, facts), `footer` the footer. Set the resting edge colour with the
     * variable, e.g. `[--card-border-color:var(--colors-delta-200)]`, so focus, pressed, selected and
     * overdue still draw their own edge; a plain `border-*` class would hide them.
     */
    classes?: { root?: string; title?: string; body?: string; footer?: string }
    dataTest: string
    /** Body slot. Wrap any interactive element in `CardControl`. */
    children?: ReactNode
}

/**
 * Every visible and accessible string of the card family. ui-core ships bokmål (the wording decided in
 * the card contract, Q11) and English; pick one with `locale` and override single strings with `labels`.
 *
 * @see asma-modules/_docs/ux/components/component-card.md:383 — §12 Q11
 */
export interface CardLabels {
    select: string
    viewingNow: string
    unread: string
    selectFor: (title: string) => string
    moreActionsFor: (title: string) => string
    /** A control's name followed by its card's title, e.g. "Delt status, «Av-Grunndata»" (CARD-5). */
    withTitle: (label: string, title: string) => string
}

export const CARD_LABELS: Record<UiCoreLocale, CardLabels> = {
    no: {
        select: 'Velg',
        viewingNow: 'Vises nå',
        unread: 'Ulest',
        selectFor: (title) => `Velg «${title}»`,
        moreActionsFor: (title) => `Flere handlinger for «${title}»`,
        withTitle: (label, title) => `${label}, «${title}»`,
    },
    en: {
        select: 'Select',
        viewingNow: 'Viewing now',
        unread: 'Unread',
        selectFor: (title) => `Select “${title}”`,
        moreActionsFor: (title) => `More actions for “${title}”`,
        withTitle: (label, title) => `${label}, “${title}”`,
    },
}
