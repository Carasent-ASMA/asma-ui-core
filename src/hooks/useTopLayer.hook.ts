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
