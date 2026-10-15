/**
 * One definition of "what a keyboard user can land on", shared by every component that reasons about
 * focus order — the focus trap, the popover and filter-menu Tab contracts, and the tooltip's hunt for
 * the control its description belongs to.
 *
 * **No tag list.** The browser already computes focusability, so we ask it instead of maintaining our
 * own catalogue of element types. `tabIndex` returns 0 for anything natively focusable (`button`,
 * `a[href]`, `input`, `select`, `textarea`, `audio[controls]`, …) and -1 for anything that is not,
 * without us naming any of them; `:disabled` is the browser's own notion of a switched-off control,
 * which also covers a control inside a `disabled` `<fieldset>`; `checkVisibility()` drops what is
 * rendered away. A hand-written selector list missed those last two cases and had to be kept in sync
 * by hand in four files.
 *
 * `inert` needs its own check: nothing else reports it. The attribute is inherited by the whole
 * subtree but the `inert` *property* is not, `tabIndex` keeps its value, and `checkVisibility()` is
 * true for a panel that is merely clipped (`height: 0`) — yet the browser refuses focus outright.
 * Components rely on that: the collapsed accordion panel, the minimized `MinimizableDialog` and the
 * hidden half of its V2 both mark their subtree `inert` rather than unmounting it.
 *
 * Known gap: a subtree blocked by a modal `<dialog>` is inert without carrying the attribute, so it
 * is not detected — every caller here already works inside the active region. Chrome also reports
 * `tabIndex === 0` for an `<a>` with no `href`, which is not focusable.
 * Degenerate enough to accept — the alternative is to start naming tags again. Two elements that
 * *are* focusable report -1 (`<summary>`, `[contenteditable]`); the previous selector list missed
 * them too, so nothing regressed. The library-grade answer for all of this is the `tabbable` package,
 * already in the tree at 6.5.0 via `@floating-ui/react` but not a direct dependency — swapping the
 * body of `isTabbable` for it needs only a `package.json` entry, and no call site changes.
 */
const isTabbable = (element: HTMLElement): boolean =>
    element.tabIndex >= 0 &&
    !element.matches(':disabled') &&
    !element.closest('[inert]') &&
    (element.checkVisibility?.() ?? true)

const isFocusable = (element: HTMLElement): boolean =>
    (element.tabIndex >= 0 || element.hasAttribute('tabindex')) && !element.matches(':disabled')

/** Every element inside `root` a Tab press can reach, in DOM order. */
export const tabbableWithin = (root: ParentNode): HTMLElement[] =>
    Array.from(root.querySelectorAll<HTMLElement>('*')).filter(isTabbable)

/**
 * The element a keyboard user actually lands on for `root`: `root` itself when it is tabbable, else
 * its first tabbable descendant. `null` when the subtree holds nothing reachable — a decorative or
 * disabled control, which the caller has to decide about.
 */
export const firstTabbable = (root: HTMLElement): HTMLElement | null =>
    isTabbable(root) ? root : (Array.from(root.querySelectorAll<HTMLElement>('*')).find(isTabbable) ?? null)

/**
 * The element a description belongs to for `root`: its first focusable element, including a
 * roving-tabindex item (`tabindex="-1"`, an unselected tab or a menu item) that arrow keys still move
 * focus to — inside a `tablist` or `menu` the wrapper would be a child those roles do not allow.
 * Unlike `firstTabbable` it ignores a temporarily unreachable subtree: a reasoned control inside a
 * collapsed accordion panel (`inert`) or a `display: none` parent is still the element a description
 * belongs to once the panel opens, and neither state change re-renders the describer.
 */
export const firstFocusable = (root: HTMLElement): HTMLElement | null =>
    isFocusable(root) ? root : (Array.from(root.querySelectorAll<HTMLElement>('*')).find(isFocusable) ?? null)
