/**
 * In-page measurement probes for the WCAG robustness criteria that axe cannot see:
 * SC 1.4.4, 1.4.10, 1.4.12, 2.5.8 and forced-colors. ASMA-8140.
 *
 * Every export here is handed to `page.evaluate`, so each function must be entirely
 * self-contained — no module-scope references, no shared helpers. Playwright serialises
 * the function source and evaluates it in a fresh browser realm where this module does
 * not exist.
 *
 * @see visual-tests/A11Y-ROBUSTNESS.md for the audit that produced the numbers these
 *      probes assert against.
 */

/** Elements that take pointer input. Kept in one place so target and clash sets agree. */
const TARGET_SELECTOR =
    'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=option], [role=tab], [role=checkbox], [role=radio], [role=switch], [role=menuitem], [tabindex]:not([tabindex="-1"])'

/**
 * The four declarations SC 1.4.12 requires a page to survive. Applied as an author
 * stylesheet with `!important` so it beats the inline styles `field-styles.ts` pins.
 */
export const TEXT_SPACING_CSS = `*, *::before, *::after {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p { margin-bottom: 2em !important; }`

/** SC 1.4.4 asks for 200% text scaling; Storybook's root is 16px, so 32px is 200%. */
export const TEXT_ZOOM_200_CSS = 'html { font-size: 32px !important; }'

export interface MeasuredTarget {
    tag: string
    role: string
    dataTest: string
    className: string
    label: string
    /** True when the measured box came from an ancestor, not the queried element. */
    resolvedFromAncestor: boolean
    width: number
    height: number
    /** SC 2.5.8 is satisfied for an undersized target when this is true. */
    spacingExceptionMet: boolean
    clash: { how: string; with: string } | null
}

/**
 * Measures every pointer target and evaluates SC 2.5.8 against it.
 *
 * Two subtleties the raw box does not capture, both learned from the ASMA-8140 audit:
 *
 * 1. A visually-hidden native control is not the target. `StyledCheckbox` renders
 *    `input.sr-only` (1x1) inside a 40x40 `label` wrapper that the click actually lands
 *    on. Measuring the input reports 96 phantom failures across the library; measuring
 *    the wrapper reports the truth. So a sub-2px box resolves to its nearest ancestor
 *    that is a label, has `cursor: pointer`, or carries a role.
 *
 * 2. Undersized is not the same as failing. SC 2.5.8's spacing exception excuses a small
 *    target when a 24px-diameter circle centred on it reaches neither another target's
 *    box nor another undersized target's circle. `StyledSwitch` (38x22) and the chip
 *    delete button (20x20) both rely on this, so a size-only assertion would be wrong.
 */
export const collectTargets = (selector: string): MeasuredTarget[] => {
    const isRendered = (element: Element): boolean => {
        const style = getComputedStyle(element)
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false
        return !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true'
    }

    const resolve = (element: Element): { node: Element; rect: DOMRect; resolved: boolean } => {
        const own = element.getBoundingClientRect()
        if (own.width > 2 && own.height > 2) return { node: element, rect: own, resolved: false }

        let parent = element.parentElement
        while (parent && parent !== document.body) {
            const rect = parent.getBoundingClientRect()
            if (rect.width > 2 && rect.height > 2) {
                const style = getComputedStyle(parent)
                if (parent.tagName === 'LABEL' || style.cursor === 'pointer' || parent.getAttribute('role')) {
                    return { node: parent, rect, resolved: true }
                }
            }
            parent = parent.parentElement
        }
        return { node: element, rect: own, resolved: false }
    }

    const describe = (element: Element): string =>
        element.getAttribute('data-test') ??
        element.getAttribute('data-testid') ??
        element.getAttribute('aria-label') ??
        (element.textContent ?? '').trim().slice(0, 40)

    const collected: { node: Element; rect: DOMRect; resolved: boolean; source: Element }[] = []
    for (const element of document.querySelectorAll(selector)) {
        if (!isRendered(element)) continue
        const resolved = resolve(element)
        if (resolved.rect.width === 0 || resolved.rect.height === 0) continue
        collected.push({ ...resolved, source: element })
    }

    /* Two queried elements can resolve onto the same wrapper (a label containing both a
     * hidden input and a role-bearing span) — count that hit area once. */
    const unique: typeof collected = []
    const seen = new Set<Element>()
    for (const entry of collected) {
        if (seen.has(entry.node)) continue
        seen.add(entry.node)
        unique.push(entry)
    }

    const minimumDimension = (rect: DOMRect): number => Math.min(rect.width, rect.height)
    const centreOf = (rect: DOMRect): { x: number; y: number } => ({
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    })
    /* A 24px circle (radius 12) centred on `centre` reaching into `rect`. */
    const circleReachesBox = (centre: { x: number; y: number }, rect: DOMRect): boolean => {
        const nearestX = Math.max(rect.x, Math.min(centre.x, rect.x + rect.width))
        const nearestY = Math.max(rect.y, Math.min(centre.y, rect.y + rect.height))
        return (nearestX - centre.x) ** 2 + (nearestY - centre.y) ** 2 < 12 ** 2
    }

    const results: MeasuredTarget[] = []
    for (const entry of unique) {
        if (minimumDimension(entry.rect) >= 24) continue

        const centre = centreOf(entry.rect)
        let clash: { how: string; with: string } | null = null
        for (const other of unique) {
            if (other.node === entry.node) continue
            if (minimumDimension(other.rect) < 24) {
                const otherCentre = centreOf(other.rect)
                /* Two 12px radii intersect below 24px of centre separation. */
                if ((otherCentre.x - centre.x) ** 2 + (otherCentre.y - centre.y) ** 2 < 24 ** 2) {
                    clash = { how: 'circle-circle', with: describe(other.source) }
                    break
                }
            } else if (circleReachesBox(centre, other.rect)) {
                clash = { how: 'circle-box', with: describe(other.source) }
                break
            }
        }

        results.push({
            tag: entry.source.tagName.toLowerCase(),
            role: entry.source.getAttribute('role') ?? entry.node.getAttribute('role') ?? '',
            dataTest: entry.source.getAttribute('data-test') ?? entry.source.getAttribute('data-testid') ?? '',
            className: typeof entry.node.className === 'string' ? entry.node.className.slice(0, 80) : '',
            label: describe(entry.source),
            resolvedFromAncestor: entry.resolved,
            width: Math.round(entry.rect.width * 10) / 10,
            height: Math.round(entry.rect.height * 10) / 10,
            spacingExceptionMet: clash === null,
            clash,
        })
    }
    return results
}

export interface ClippedText {
    tag: string
    className: string
    dataTest: string
    /** Overflow beyond the padding box, in px, on each clipped axis. */
    overflowX: number
    overflowY: number
    clientWidth: number
    clientHeight: number
    text: string
}

/**
 * Finds text that its own container is cutting off — `overflow: hidden`/`clip` with
 * content wider or taller than the box.
 *
 * This is the "loss of content" test for SC 1.4.4 and 1.4.12. It is deliberately run
 * before and after the override so the assertion is about *newly* clipped text: the
 * library truncates on purpose in several places (`truncate`, `line-clamp-2`), and
 * flagging pre-existing truncation would drown the signal.
 */
export const collectClippedText = (): ClippedText[] => {
    const results: ClippedText[] = []
    for (const element of document.querySelectorAll('*')) {
        const style = getComputedStyle(element)
        if (style.display === 'none' || style.visibility === 'hidden') continue

        const clipsX = style.overflowX === 'hidden' || style.overflowX === 'clip'
        const clipsY = style.overflowY === 'hidden' || style.overflowY === 'clip'
        if (!clipsX && !clipsY) continue

        const text = (element.textContent ?? '').trim()
        if (text.length === 0) continue

        const overflowX = element.scrollWidth - element.clientWidth
        const overflowY = element.scrollHeight - element.clientHeight
        if (!((clipsX && overflowX > 1) || (clipsY && overflowY > 1))) continue

        results.push({
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className.slice(0, 80) : '',
            dataTest: element.getAttribute('data-test') ?? element.getAttribute('data-testid') ?? '',
            overflowX: clipsX ? overflowX : 0,
            overflowY: clipsY ? overflowY : 0,
            clientWidth: element.clientWidth,
            clientHeight: element.clientHeight,
            text: text.slice(0, 60),
        })
    }
    return results
}

/** Identity for diffing two `collectClippedText` runs across a style change. */
export const clippedTextKey = (clipped: ClippedText): string =>
    `${clipped.tag}|${clipped.className}|${clipped.text}`

/**
 * True once the forced-colors emulation the tests depend on is actually in effect.
 *
 * Worth asserting rather than assuming: `test.use({ forcedColors: 'active' })` is
 * silently swallowed by this project's `use.contextOptions` in playwright.config.ts, so
 * the emulation has to be applied per page via `emulateMedia`. Without this check a
 * forced-colors test passes by measuring ordinary colours — a gate that proves nothing.
 */
export const forcedColorsActive = (): boolean => matchMedia('(forced-colors: active)').matches

/** Horizontal document overflow — the two-dimensional scrolling SC 1.4.10 forbids. */
export const measureDocumentOverflow = (): { scrollWidth: number; clientWidth: number } => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
})

export interface ControlPaint {
    found: boolean
    background: string
    borderColor: string
    borderWidth: string
    color: string
    boxShadow: string
    forcedColorAdjust: string
    indicator: { background: string; color: string; opacity: string } | null
}

/**
 * Snapshots the declarations a custom-drawn control relies on to show its state, so the
 * same story can be compared with and without forced-colors emulation.
 */
export const probeControlPaint = (selector: string): ControlPaint => {
    const element = document.querySelector(selector)
    if (!element) {
        return {
            found: false,
            background: '',
            borderColor: '',
            borderWidth: '',
            color: '',
            boxShadow: '',
            forcedColorAdjust: '',
            indicator: null,
        }
    }
    const style = getComputedStyle(element)
    const indicator = element.querySelector('[class*="_Indicator_"], [class*="_thumb_"]')
    const indicatorStyle = indicator ? getComputedStyle(indicator) : null
    return {
        found: true,
        background: style.backgroundColor,
        borderColor: style.borderTopColor,
        borderWidth: style.borderTopWidth,
        color: style.color,
        boxShadow: style.boxShadow,
        forcedColorAdjust: style.forcedColorAdjust,
        indicator: indicatorStyle
            ? {
                  background: indicatorStyle.backgroundColor,
                  color: indicatorStyle.color,
                  opacity: indicatorStyle.opacity,
              }
            : null,
    }
}

/**
 * Finds anything opting out of forced-colors. An element with
 * `forced-color-adjust: none` keeps its author colours in High Contrast mode, which
 * silences the OS palette rather than adapting to it.
 */
export const collectForcedColorOptOuts = (): { tag: string; className: string }[] => {
    const results: { tag: string; className: string }[] = []
    for (const element of document.querySelectorAll('*')) {
        if (getComputedStyle(element).forcedColorAdjust !== 'none') continue
        results.push({
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className.slice(0, 80) : '',
        })
    }
    return results
}

export { TARGET_SELECTOR }
