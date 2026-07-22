import { useCallback, type CSSProperties } from 'react'

/**
 * Promote a Floating UI element into the browser **top layer** so it paints above a native modal
 * `<dialog>`.
 *
 * `StyledDialog` opens via `<dialog>.showModal()`, which puts the dialog in the top layer. The top
 * layer sits above the entire normal stacking context, so a popover/menu/listbox portalled to
 * `document.body` is occluded by the dialog **no matter how high its `z-index`** (and is `inert`
 * while the modal is open). The only way to render above it is to also join the top layer — which
 * the native Popover API does. We give the floating element `popover="manual"` (manual = we drive
 * open/close ourselves, no light-dismiss) and call `showPopover()` the moment it mounts; the top
 * layer stacks by call order, so a popover shown after the dialog lands on top.
 *
 * Usage: spread {@link TOP_LAYER_PROPS} on the floating element, put {@link TOP_LAYER_RESET_STYLE}
 * before `...floatingStyles` in its `style`, use `strategy: 'fixed'` on `useFloating`, and pass
 * `refs.setFloating` to {@link useTopLayerRef} — attach the returned callback as the element `ref`
 * (merge with any others). Promoting on the ref callback (not a `useEffect`) guarantees it runs the
 * instant the node is connected, before paint.
 */
export const TOP_LAYER_PROPS = { popover: 'manual' } as const

/**
 * Neutralises the UA popover box styles (`[popover]{ inset: 0; margin: auto }`) that would
 * otherwise fight Floating UI's `top`/`left`. Spread this BEFORE `...floatingStyles`.
 */
export const TOP_LAYER_RESET_STYLE: CSSProperties = { margin: 0, inset: 'auto' }

/**
 * Find the nearest **open modal** `<dialog>` ancestor of a reference node, or `undefined`.
 *
 * A native modal `<dialog>` (`showModal()`) marks every node **outside its own subtree** as `inert`
 * — including a popover we promote into the top layer. An inert popover still *paints* (so it looks
 * fine, even on top), but it is skipped by hit-testing: pointer clicks fall through to the dialog
 * behind it and options can't be selected. Promoting to the top layer only fixes painting/z-order,
 * NOT inertness. The one place a popover is both unclipped *and* interactive is **inside the modal
 * dialog's own subtree** (top layer → escapes the dialog's `overflow:hidden`; descendant of the
 * dialog → not inert). So when the trigger lives inside a modal dialog, the floating element must
 * portal into that dialog rather than `document.body`. Returns `undefined` for the non-dialog case
 * (and for non-modal containers like `MinimizableDialog`, which are plain z-indexed `<div>`s), so
 * the caller falls back to the default body portal.
 */
export function getOpenModalDialogAncestor(node: unknown): HTMLElement | undefined {
    if (!(node instanceof Element)) return undefined
    const dialog = node.closest('dialog')
    return dialog instanceof HTMLDialogElement && dialog.open ? dialog : undefined
}

type RefSetter = (node: HTMLElement | null) => void

/**
 * Returns a ref callback that wires the node into Floating UI (`setFloating`) and, on mount,
 * promotes it to the top layer via the Popover API. Degrades to plain z-index if unsupported.
 */
export function useTopLayerRef(setFloating: RefSetter): RefSetter {
    return useCallback(
        (node: HTMLElement | null) => {
            setFloating(node)
            if (!node) return
            try {
                if (typeof node.showPopover === 'function' && !node.matches(':popover-open')) node.showPopover()
            } catch {
                // Popover API unavailable / element not eligible — degrade to plain z-index stacking.
            }
        },
        [setFloating],
    )
}
