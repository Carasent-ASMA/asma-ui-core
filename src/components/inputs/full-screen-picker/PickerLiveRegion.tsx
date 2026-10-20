import { useCallback, useEffect, useState } from 'react'

/** One message for a live region. `id` changes on every `announce`, so a repeated text is read again. */
export interface PickerAnnouncement {
    text: string
    id: number
}

/**
 * Holds the latest announcement for `FullScreenPicker`'s `announcement` prop, which a screen reader
 * reads out politely from inside the dialog (counts, matches, *No matches*). `announce` accepts the
 * same text twice and still re-announces it; `reset` forgets it, so the next opening starts silent.
 *
 * @example
 * const [announcement, announce, resetAnnouncement] = useAnnouncer()
 * // on a tick: announce(`${ticked.length} selected`); when the picker opens: resetAnnouncement()
 * <FullScreenPicker announcement={announcement} … />
 */
export const useAnnouncer = (): [PickerAnnouncement | undefined, (text: string) => void, () => void] => {
    const [announcement, setAnnouncement] = useState<PickerAnnouncement>()
    const announce = useCallback((text: string) => setAnnouncement((previous) => ({ text, id: (previous?.id ?? 0) + 1 })), [])
    const reset = useCallback(() => setAnnouncement(undefined), [])
    return [announcement, announce, reset]
}

/**
 * Polite live region for the picker (ASMA-8468 REQ-011/013/016). Inside the dialog it must be
 * rendered **in** the dialog: while `showModal()` is active everything outside is inert and not
 * reliably announced (ALT-005).
 *
 * The text is emptied and set again on the next frame, so the same message twice in a row
 * (`0 valgt` after two clears) is read out again.
 */
export const PickerLiveRegion = ({
    announcement,
    dataTest,
}: {
    announcement?: PickerAnnouncement
    dataTest?: string
}): JSX.Element => {
    const [text, setText] = useState('')

    useEffect(() => {
        // Clear first, set next frame: a repeated message must change the DOM to be read again.
        // eslint-disable-next-line react-hooks/set-state-in-effect, react-you-might-not-need-an-effect/no-adjust-state-on-prop-change
        setText('')
        if (!announcement) return undefined
        const id = requestAnimationFrame(() => setText(announcement.text))
        return () => cancelAnimationFrame(id)
    }, [announcement])

    return (
        <div role='status' aria-live='polite' aria-atomic='true' className='sr-only' data-testid={dataTest}>
            {text}
        </div>
    )
}
