import { createContext, useCallback, useContext, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'
import type { CardCheckbox, CardHeadingLevel, CardModel, CardOpen } from './Card.types'

// ─── Model ──────────────────────────────────────────────────────────────────

export interface CardModelInput {
    open?: CardOpen
    readOnly?: boolean
    checkbox?: boolean
    menu?: boolean
    footerAction?: boolean
    ctaAction?: boolean
}

/**
 * The model follows what the card does (CARD-2): it opens nothing → static; it opens one thing and
 * holds any control → partially clickable; otherwise fully clickable. Select mode never changes it.
 *
 * @see asma-modules/_docs/ux/components/component-card.md:114 — §4 Interaction models
 */
export const resolveCardModel = (input: CardModelInput, bodyControlCount: number): CardModel => {
    if (!input.open || input.readOnly) return 'static'

    const holdsControl = [input.checkbox, input.menu, input.footerAction, input.ctaAction].some(Boolean) || bodyControlCount > 0

    return holdsControl ? 'partial' : 'full'
}

// ─── Overdue ────────────────────────────────────────────────────────────────

const toCalendarDay = (date: Date): number => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())

const MS_PER_DAY = 86_400_000

/**
 * Whole calendar days since the due date, in local time; 0 on the due date or before it.
 * The card's overdue words ("Forfalt • N dager") are built by the app from this number (CARD-10).
 *
 * @see asma-modules/_docs/ux/components/component-card.md:169 — CARD-10
 */
export const getOverdueDays = (dueDate: Date, today: Date = new Date()): number => {
    const days = Math.round((toCalendarDay(today) - toCalendarDay(dueDate)) / MS_PER_DAY)
    return Math.max(0, days)
}

// ─── Context ────────────────────────────────────────────────────────────────

/** What a body control needs to name itself after its card (CARD-5). */
export interface CardContextValue {
    titleText: string
    /** The label followed by the card's title in the card's locale, e.g. "Delt status, «Av-Grunndata»". */
    composeName: (label: string) => string
    registerControl: () => () => void
}

export const CardContext = createContext<CardContextValue | null>(null)

/** Read the surrounding card's title and naming helper from inside its body. */
export const useCardContext = (): CardContextValue => {
    const value = useContext(CardContext)
    if (!value) throw new Error('useCardContext must be used inside a Card')
    return value
}

/** Provided by `CardList` to every card in it (CARD-7, CARD-8, CARD-13). */
export interface CardListItemContextValue {
    headingLevel?: CardHeadingLevel
    checkbox?: CardCheckbox
    locale?: UiCoreLocale
}

export const CardListItemContext = createContext<CardListItemContextValue>({})

// ─── Pressed hold ───────────────────────────────────────────────────────────

const MIN_PRESSED_MS = 100

const isOnCardLink = (target: EventTarget): boolean =>
    target instanceof Element && target.closest('[data-card-control]') === null && target.closest('[data-card-link]') !== null

interface PressedHoldHandlers {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void
    onPointerUp: () => void
    onPointerLeave: () => void
    onPointerCancel: () => void
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
    onKeyUp: () => void
}

/**
 * Keeps the card's pressed look for at least ~100 ms, so a fast tap still shows it; dragging off
 * the card cancels it. Only a press on the card's own link counts, never one on a control (CARD-15).
 *
 * @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md:81 — Timing and motion
 */
export const usePressedHold = (): { isPressed: boolean; handlers: PressedHoldHandlers } => {
    const [isPressed, setIsPressed] = useState(false)
    const pressedAt = useRef(0)
    const releaseTimer = useRef<ReturnType<typeof setTimeout>>()

    const press = useCallback(() => {
        clearTimeout(releaseTimer.current)
        pressedAt.current = Date.now()
        setIsPressed(true)
    }, [])

    const release = useCallback(() => {
        const remaining = MIN_PRESSED_MS - (Date.now() - pressedAt.current)
        clearTimeout(releaseTimer.current)
        releaseTimer.current = setTimeout(() => setIsPressed(false), Math.max(0, remaining))
    }, [])

    const cancel = useCallback(() => {
        clearTimeout(releaseTimer.current)
        setIsPressed(false)
    }, [])

    useEffect(() => () => clearTimeout(releaseTimer.current), [])

    const handlers: PressedHoldHandlers = {
        onPointerDown: (event) => {
            if (isOnCardLink(event.target)) press()
        },
        onPointerUp: release,
        onPointerLeave: cancel,
        onPointerCancel: cancel,
        onKeyDown: (event) => {
            if (event.key === 'Enter' && isOnCardLink(event.target)) press()
        },
        onKeyUp: release,
    }

    return { isPressed, handlers }
}
