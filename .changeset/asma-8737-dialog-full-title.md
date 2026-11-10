---
'asma-ui-core': minor
---

ASMA-8737: dialogs show their full title. Every `StyledDialog`, `MinimizableDialog` and `MinimizableDialogV2` changes, with no new props, so this is a minor release.

- **The title is on its own row** under the header actions, at the full dialog width: 24/32 Bold from 744 px wide, 20/26 Bold below. It is never truncated or clamped. A `<StyledDialogTitle>` child moves into that row too. `dialogTitle`, `title`, `dialogLabel` and `<StyledDialogTitle>` keep their props.
- **The header is pinned only when there is room.** It stays pinned when the screen is taller than `30em` and the measured header is at most 25% of `window.innerHeight`. Otherwise it scrolls with the content. Header and content now scroll in one region. `StyledDialogContent` placed directly in a `StyledDialog` grows instead of scrolling on its own, and `StyledDialogActions` and `StyledDialogFooter` stay pinned at the bottom. A pinned header reserves its height as `scroll-padding-top`.
- **The DOM inside the paper changed.** It is now `[data-dialog-body]` (the one scroller) holding `[data-dialog-header]` and `[data-dialog-content-flow]`, which wraps the children. A consumer selector on the paper's direct children (`paper > :first-child`, `> form`) must target these instead, and scroll listeners belong on `[data-dialog-body]`. `scroll='body'` no longer changes where content scrolls. Inside a dialog, every `[data-dialog-footer]` sticks to the bottom, whatever `StyledDialogFooter`'s `fixed` says. Style content through the new `[data-dialog-content]` attribute, never the `data-test` hook.
- **The on-screen keyboard hides a pinned header** (`inert`, `aria-hidden`) until it closes. The dialog stays named by its title.
- **The minimized bar stays one line.** Its tooltip shows the full title on hover and on keyboard focus, in both versions.
- **New exports** for overlays with their own header: `useOnScreenKeyboardOpen`, `isOnScreenKeyboardOpen`, `useElementHeightPx`, `useVisualViewportHeight`, `useLayoutViewportHeight`, `useShortScreenMediaQuery` (`30em`) and `useDialogHeaderPinning`. `useShortViewportMediaQuery` (`480px`, Bottom Sheet) is unchanged.
