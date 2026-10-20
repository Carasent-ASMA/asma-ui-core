import { createContext } from 'react'

/**
 * Lets a `<StyledDialogTitle>` child name the dialog that contains it.
 *
 * `StyledDialog` can point `aria-labelledby` at its own `dialogTitle` prop directly, but a large
 * share of consumers render the title as a child instead (e.g. advoca's privacy-consent modal).
 * Without this, those dialogs fall back to having no accessible name at all — WCAG 4.1.2 requires
 * the dialog to be named by its visible title, not by a test hook.
 */
export interface StyledDialogTitleContextValue {
    /** `id` the title adopts so the dialog can reference it. */
    titleId: string
    /** Registers the title's actual id, including an explicit caller-supplied id. */
    setTitleId: (titleId: string | undefined) => void
}

export const StyledDialogTitleContext = createContext<StyledDialogTitleContextValue | null>(null)
