export interface PaddingSides { top: string; right: string; bottom: string; left: string }

/** ponytail: tailwind `important: true` beats inline `style` — setProperty wins */
export const applyImportantPadding = (el: HTMLElement | null, padding: PaddingSides): void => {
    if (!el) return
    el.style.setProperty('padding-top', padding.top, 'important')
    el.style.setProperty('padding-right', padding.right, 'important')
    el.style.setProperty('padding-bottom', padding.bottom, 'important')
    el.style.setProperty('padding-left', padding.left, 'important')
}
