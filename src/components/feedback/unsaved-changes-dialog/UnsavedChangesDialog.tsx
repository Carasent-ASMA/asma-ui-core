import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { DeleteOutlineIcon, EditSquareSharpIcon, SaveIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'

import { StyledDialog } from '../dialog/StyledDialog'

/** The action that is running: its button is busy and the other buttons wait. */
export type UnsavedChangesPendingAction = 'save' | 'delete'

/**
 * The label of the save button. `leave` ("Save and leave") is the one label everywhere; `refresh`
 * ("Save and refresh") is the single exception, for refreshing a workspace questionnaire (ASMA-8895).
 */
export type UnsavedChangesSaveLabel = 'leave' | 'refresh'

export interface UnsavedChangesDialogProps {
    open: boolean
    /**
     * Keep editing: the safe choice. Escape, a click outside and browser Back run it too. The app
     * closes the dialog and the user stays where they were; nothing is saved or deleted.
     */
    onKeepEditing: () => void
    /**
     * Delete changes: the app drops the changes and goes where the user asked to go. Return the
     * Promise when it is async: the button stays busy until it settles and nothing else can run.
     */
    onDelete: () => void | Promise<unknown>
    /**
     * Shows the version with save ("Save changes?" and Save and leave). Leave it out for the default
     * version without save. UX approves every screen that keeps save (ASMA-8895): workspaces, the
     * questionnaire designer and document drafts.
     *
     * The app saves and leaves only when the save worked. On a failure it closes the dialog and moves
     * focus to the problem (a missing answer, the error), so the user is never moved on with unsaved
     * work. Return the Promise when it is async, for the same busy state as `onDelete`.
     */
    onSave?: () => void | Promise<unknown>
    /** Label of the save button; defaults to "Save and leave". */
    saveLabel?: UnsavedChangesSaveLabel
    /**
     * An action the app runs outside the Promise it returned (a store flag, an event round trip).
     * Its button is busy and the others wait, as for a returned Promise.
     */
    pendingAction?: UnsavedChangesPendingAction
    /** Language of every text in the dialog; defaults to English. */
    locale?: UiCoreLocale
    dataTest?: string
}

/**
 * The agreed texts (ASMA-8895). ui-core owns them, so every app asks the same question in the same
 * words; apps cannot pass their own. The Norwegian is subject to the native review on ASMA-8895.
 */
const TEXTS = {
    en: {
        titleWithSave: 'Save changes?',
        titleWithoutSave: 'Delete changes?',
        unsaved: 'You have unsaved changes.',
        consequence: 'If you leave without saving, they are deleted.',
        deleteChanges: 'Delete changes',
        keepEditing: 'Keep editing',
        saveAndLeave: 'Save and leave',
        saveAndRefresh: 'Save and refresh',
        waitUntilSaved: 'Wait until saved',
        waitUntilDeleted: 'Wait until deleted',
    },
    no: {
        titleWithSave: 'Lagre endringene?',
        titleWithoutSave: 'Slette endringene?',
        unsaved: 'Du har endringer som ikke er lagret.',
        consequence: 'Hvis du går ut uten å lagre, blir de slettet.',
        deleteChanges: 'Slett endringer',
        keepEditing: 'Fortsett å redigere',
        saveAndLeave: 'Lagre og avslutt',
        saveAndRefresh: 'Lagre og oppdater',
        waitUntilSaved: 'Vent til lagringen er ferdig',
        waitUntilDeleted: 'Vent til slettingen er ferdig',
    },
} as const

const isPromise = (value: unknown): value is Promise<unknown> =>
    typeof (value as Promise<unknown> | undefined)?.then === 'function'

/**
 * Developer: alexandr.doicov@carasent.com
 *
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#47548-220018
 * @remarks Figma "Unsaved changes" (`With save` on/off × `Mobile` on/off). The one unsaved-changes
 * dialog for every app (ASMA-8895). The version without save is the default; `onSave` adds Save and
 * leave. The Figma `Mobile` property is not a prop: the buttons stack, full width and in the desktop
 * order, only when they do not fit on one row.
 *
 * - Focus starts on Keep editing, so Enter never deletes.
 * - Escape, a click outside and browser Back (Back-closes-overlays, BACK-3) all mean Keep editing.
 * - While an action runs its button is busy and the others are soft-disabled with the reason (SUB-4,
 *   SUB-8); nothing closes the dialog until it ends.
 */
export function UnsavedChangesDialog({
    open,
    onKeepEditing,
    onDelete,
    onSave,
    saveLabel = 'leave',
    pendingAction,
    locale = 'en',
    dataTest = 'unsaved-changes-dialog',
}: UnsavedChangesDialogProps): JSX.Element {
    const t = TEXTS[locale] ?? TEXTS.en
    const withSave = onSave != null
    const isMobile = useMobileMediaQuery()
    const keepEditingRef = useRef<HTMLButtonElement>(null)
    const rowRef = useRef<HTMLDivElement>(null)

    // A Promise the app returned from Delete or Save. Held in a ref too, so a second press in the same
    // tick cannot start the action again before React re-renders the busy button.
    const [running, setRunning] = useState<UnsavedChangesPendingAction>()
    const runningRef = useRef<UnsavedChangesPendingAction>()
    const mountedRef = useRef(true)
    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    const busyAction = pendingAction ?? running
    const busyReason = busyAction === 'delete' ? t.waitUntilDeleted : t.waitUntilSaved

    const run = (action: UnsavedChangesPendingAction, handler: () => void | Promise<unknown>): void => {
        if (busyAction || runningRef.current) return
        const result = handler()
        if (!isPromise(result)) return
        runningRef.current = action
        setRunning(action)
        const settle = (): void => {
            runningRef.current = undefined
            if (mountedRef.current) setRunning(undefined)
        }
        result.then(settle, settle)
    }

    // Stack the buttons only when they do not fit on one row (ASMA-8895 §3). The row width they need is
    // measured while they sit on one row and kept, because stacked buttons are full width and no longer
    // tell it. Other texts or another button set need a new measurement, so they start on one row again.
    const layoutKey = `${locale}|${withSave ? saveLabel : 'none'}`
    const [stackState, setStackState] = useState({ layoutKey, stacked: false })
    const stacked = stackState.layoutKey === layoutKey && stackState.stacked
    const requiredRowWidthRef = useRef(0)
    useLayoutEffect(() => {
        const setStacked = (next: boolean): void => setStackState({ layoutKey, stacked: next })
        const row = rowRef.current
        if (!open || !row) return undefined
        const measure = (): void => {
            if (!stacked) {
                if (row.scrollWidth > row.clientWidth) {
                    requiredRowWidthRef.current = row.scrollWidth
                    setStacked(true)
                }
            } else if (row.clientWidth >= requiredRowWidthRef.current) {
                setStacked(false)
            }
        }
        measure()
        if (typeof ResizeObserver === 'undefined') return undefined
        const observer = new ResizeObserver(measure)
        observer.observe(row)
        return () => observer.disconnect()
    }, [open, stacked, layoutKey])

    const deleteBusy = busyAction === 'delete'
    const saveBusy = busyAction === 'save'
    const iconSize = 24

    return (
        <StyledDialog
            open={open}
            dataTest={dataTest}
            locale={locale}
            showCloseIcon={false}
            maxWidth={false}
            fullScreen={false}
            busyReason={busyReason}
            initialFocusRef={keepEditingRef}
            // Escape, the backdrop and Back all keep editing. StyledDialog already ignores them while a
            // button is busy (a loading StyledButton holds the dialog), and so does `busyAction` here for
            // a busy state the app drives through `pendingAction`.
            onClose={() => {
                if (busyAction) return
                onKeepEditing()
            }}
            slotProps={{
                paper: {
                    style: {
                        // Desktop: fits its content. Phone, or whenever the buttons stack: 100vw − 32 px.
                        width: isMobile || stacked ? 'calc(100vw - 32px)' : 'max-content',
                        maxWidth: 'calc(100vw - 32px)',
                    },
                },
            }}
        >
            <div className='flex min-w-0 flex-col gap-4 p-4'>
                <h2 className='text-delta-800 m-0 text-2xl leading-8 font-semibold wrap-anywhere'>
                    {withSave ? t.titleWithSave : t.titleWithoutSave}
                </h2>
                <div className='text-delta-700 flex flex-col gap-2 text-base leading-6 font-normal'>
                    <p className='m-0'>{t.unsaved}</p>
                    <p className='m-0'>{t.consequence}</p>
                </div>
                {/* Figma: 16 px gap + 16 px top padding = 32 px from the body to the buttons. The DOM order is
                    the visual order in both layouts (WCAG 1.3.2): Delete changes, Keep editing, Save. */}
                <div
                    ref={rowRef}
                    data-testid={`${dataTest}-buttons`}
                    data-stacked={stacked ? 'true' : 'false'}
                    className={cn(
                        'flex min-w-0 pt-4',
                        stacked ? 'flex-col gap-6' : 'flex-nowrap items-start justify-between gap-10',
                    )}
                >
                    <StyledButton
                        dataTest='delete-changes-button'
                        locale={locale}
                        variant='contained'
                        error
                        size='medium'
                        className={cn(stacked && 'w-full')}
                        startIcon={<DeleteOutlineIcon width={iconSize} height={iconSize} />}
                        loading={deleteBusy}
                        disabled={saveBusy}
                        disabledReason={saveBusy ? busyReason : undefined}
                        onClick={() => run('delete', onDelete)}
                    >
                        {t.deleteChanges}
                    </StyledButton>
                    <div className={cn('flex', stacked ? 'flex-col gap-2' : 'flex-nowrap items-center gap-2')}>
                        <StyledButton
                            dataTest='keep-editing-button'
                            refLink={keepEditingRef}
                            locale={locale}
                            variant='outlined'
                            size='medium'
                            className={cn(stacked && 'w-full')}
                            startIcon={<EditSquareSharpIcon width={iconSize} height={iconSize} />}
                            disabled={Boolean(busyAction)}
                            disabledReason={busyAction ? busyReason : undefined}
                            onClick={() => {
                                if (busyAction) return
                                onKeepEditing()
                            }}
                        >
                            {t.keepEditing}
                        </StyledButton>
                        {withSave && (
                            <StyledButton
                                dataTest='save-and-leave-button'
                                locale={locale}
                                variant='contained'
                                size='medium'
                                className={cn(stacked && 'w-full')}
                                startIcon={<SaveIcon width={iconSize} height={iconSize} aria-hidden='true' focusable='false' />}
                                loading={saveBusy}
                                disabled={deleteBusy}
                                disabledReason={deleteBusy ? busyReason : undefined}
                                onClick={() => run('save', onSave)}
                            >
                                {saveLabel === 'refresh' ? t.saveAndRefresh : t.saveAndLeave}
                            </StyledButton>
                        )}
                    </div>
                </div>
            </div>
        </StyledDialog>
    )
}
