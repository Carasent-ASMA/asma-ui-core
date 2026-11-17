import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { StyledInteractiveChip } from 'src/components/data-display/interactive-chip/StyledInteractiveChip'
import { StyledEmojiChoice } from 'src/components/inputs/emoji-choice/StyledEmojiChoice'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledRadio, type StyledRadioProps } from './StyledRadio'
import { StyledRadioGroup } from './StyledRadioGroup'

/**
 * ASMA-8970. On Windows Chrome the dot sat off-centre in its ring, while Edge on the same machine drew
 * it centred. Ring and dot were two separately laid-out and rasterised boxes; now they are two
 * circles of one SVG around one centre, so no rasteriser can move one against the other.
 */

const SIZES = {
    medium: { size: 20, stroke: 2, dot: 5 },
    small: { size: 16, stroke: 1.5, dot: 4 },
} as const

type Size = keyof typeof SIZES

const radioSvgIn = (root: ParentNode): SVGSVGElement => {
    const svgs = root.querySelectorAll<SVGSVGElement>('svg')
    if (svgs.length !== 1) throw new Error(`expected exactly one radio <svg>, found ${svgs.length}`)
    return svgs[0]!
}

const circlesOf = (svg: SVGSVGElement): { ring: SVGCircleElement; dot: SVGCircleElement } => {
    const circles = svg.querySelectorAll<SVGCircleElement>('circle')
    if (circles.length !== 2) throw new Error(`expected a ring and a dot circle, found ${circles.length}`)
    return { ring: circles[0]!, dot: circles[1]! }
}

const num = (el: Element, attr: string): number => Number(el.getAttribute(attr))

describe('StyledRadio draws the ring and the dot as one SVG (ASMA-8970)', () => {
    afterEach(cleanup)

    it.each([
        ['medium', false],
        ['medium', true],
        ['small', false],
        ['small', true],
    ] as const)('%s, checked=%s: one svg, two circles, one centre', async (size, checked) => {
        const { container } = mount(<StyledRadio dataTest='r' size={size} checked={checked} />)
        const wrapper = container.querySelector('[data-testid="r"]')!
        const svg = radioSvgIn(wrapper)
        const { ring, dot } = circlesOf(svg)
        const g = SIZES[size]

        await expect(svg.getAttribute('viewBox')).toBe(`0 0 ${g.size} ${g.size}`)
        await expect([num(ring, 'cx'), num(ring, 'cy')]).toEqual([g.size / 2, g.size / 2])
        await expect([num(dot, 'cx'), num(dot, 'cy')], 'the dot shares the ring centre').toEqual([
            num(ring, 'cx'),
            num(ring, 'cy'),
        ])
        await expect(num(ring, 'r') + num(ring, 'stroke-width') / 2, 'the ring touches the box edge').toBe(g.size / 2)
        await expect(num(ring, 'stroke-width')).toBe(g.stroke)
        await expect(num(dot, 'r')).toBe(g.dot)

        const rect = svg.getBoundingClientRect()
        await expect({ width: rect.width, height: rect.height }).toEqual({ width: g.size, height: g.size })
    })

    it('keeps the circle a single graphic: no box is nested inside it', async () => {
        const { container } = mount(<StyledRadio dataTest='r' checked />)
        const wrapper = container.querySelector('[data-testid="r"]')!
        const svg = radioSvgIn(wrapper)

        await expect(svg.querySelectorAll('span, div').length).toBe(0)
        await expect(wrapper.lastElementChild, 'the circle is still the last child (hover tests rely on it)').toBe(svg)
    })

    it('hides the svg from assistive technology and keeps it out of the tab order', async () => {
        const { container } = mount(<StyledRadio dataTest='r' checked />)
        const svg = radioSvgIn(container)

        await expect(svg).toHaveAttribute('aria-hidden', 'true')
        await expect(svg).toHaveAttribute('focusable', 'false')
    })

    it('draws the same single svg for a decorative radio, with no input', async () => {
        const { container } = mount(<StyledRadio dataTest='r' decorative checked />)
        const wrapper = container.querySelector('[data-testid="r"]')!
        const { ring, dot } = circlesOf(radioSvgIn(wrapper))

        await expect(wrapper.querySelector('input')).toBeNull()
        await expect(wrapper).toHaveAttribute('aria-hidden', 'true')
        await expect(num(dot, 'cx')).toBe(num(ring, 'cx'))
    })
})

describe('StyledRadio state colours on the SVG', () => {
    afterEach(cleanup)

    type Case = [string, Partial<StyledRadioProps>, string, string | null, string]
    const cases: Case[] = [
        ['unchecked', {}, '--colors-delta-500', null, '0'],
        ['checked', { checked: true }, '--colors-gama-500', '--colors-gama-500', '1'],
        ['disabled', { disabled: true }, '--colors-delta-300', null, '0'],
        ['disabled checked', { disabled: true, checked: true }, '--colors-delta-300', '--colors-delta-300', '0.6'],
        ['read-only', { readOnly: true }, '--colors-delta-300', null, '0'],
        ['read-only checked', { readOnly: true, checked: true }, '--colors-delta-500', '--colors-delta-500', '1'],
        ['error checked', { error: true, checked: true }, '--colors-gama-500', '--colors-gama-500', '1'],
        ['small checked', { size: 'small', checked: true }, '--colors-gama-500', '--colors-gama-500', '1'],
    ]

    it.each(cases)('%s', async (_name, props, ringToken, dotToken, dotOpacity) => {
        const ringColor = resolveTokenColor(ringToken)
        const dotColor = dotToken && resolveTokenColor(dotToken)
        const { container } = mount(<StyledRadio dataTest='r' {...props} />)
        const { ring, dot } = circlesOf(radioSvgIn(container))

        await expect(getComputedStyle(ring).stroke).toBe(ringColor)
        await expect(getComputedStyle(ring).fill).toBe('none')
        await expect(getComputedStyle(dot).opacity).toBe(dotOpacity)
        if (dotColor) await expect(getComputedStyle(dot).fill).toBe(dotColor)
    })

    it('follows the surrounding group selection', async () => {
        const gama = resolveTokenColor('--colors-gama-500')
        const delta = resolveTokenColor('--colors-delta-500')
        const { container } = mount(
            <StyledRadioGroup name='g' defaultValue='b'>
                <StyledFormControlLabel label='A' control={<StyledRadio dataTest='a' value='a' />} />
                <StyledFormControlLabel label='B' control={<StyledRadio dataTest='b' value='b' />} />
            </StyledRadioGroup>,
        )
        const a = circlesOf(radioSvgIn(container.querySelector('[data-testid="a"]')!))
        const b = circlesOf(radioSvgIn(container.querySelector('[data-testid="b"]')!))

        await expect(getComputedStyle(a.ring).stroke).toBe(delta)
        await expect(getComputedStyle(a.dot).opacity).toBe('0')
        await expect(getComputedStyle(b.ring).stroke).toBe(gama)
        await expect(getComputedStyle(b.dot).opacity).toBe('1')
    })
})

describe('StyledRadio focus and error rings stay on the circle', () => {
    afterEach(cleanup)

    it('draws the keyboard focus ring around the svg circle', async () => {
        const focusRing = resolveTokenColor('--colors-focus-ring')
        const { container } = mount(<StyledRadio dataTest='r' value='a' />)
        const svg = radioSvgIn(container)

        await userEvent.tab()
        await expect(document.activeElement).toBe(container.querySelector('input'))
        await expect(getComputedStyle(svg).boxShadow).toContain(focusRing)
        await expect(getComputedStyle(svg).borderRadius).toBe('50%')
    })

    it('draws the error ring around the svg circle', async () => {
        const errorColor = resolveTokenColor('--colors-error-500')
        const { container } = mount(<StyledRadio dataTest='r' error />)

        await expect(getComputedStyle(radioSvgIn(container)).boxShadow).toContain(errorColor)
    })
})

const systemColor = (name: string): string => {
    const probe = document.createElement('span')
    probe.style.color = name
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
}

describe('StyledRadio in forced colours', () => {
    afterEach(async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [] })
        cleanup()
    })

    it('keeps the ring and the checked dot visible against the page', async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
        const { container } = mount(<StyledRadio dataTest='r' checked />)
        const { ring, dot } = circlesOf(radioSvgIn(container))
        const canvas = systemColor('Canvas')

        await expect(getComputedStyle(ring).stroke).not.toBe(canvas)
        await expect(getComputedStyle(dot).fill).not.toBe(canvas)
        await expect(getComputedStyle(dot).fill).toBe(getComputedStyle(ring).stroke)
        await expect(getComputedStyle(dot).opacity).toBe('1')
    })
})

describe('every radio consumer renders the single-SVG radio', () => {
    afterEach(cleanup)

    const expectConcentric = async (root: ParentNode): Promise<void> => {
        const { ring, dot } = circlesOf(radioSvgIn(root))
        await expect([num(dot, 'cx'), num(dot, 'cy')]).toEqual([num(ring, 'cx'), num(ring, 'cy')])
        await expect(getComputedStyle(dot).opacity).toBe('1')
    }

    it('StyledInteractiveChip type="radio"', async () => {
        const { container } = mount(<StyledInteractiveChip dataTest='chip' type='radio' checked label='Only mine' onClick={() => undefined} />)
        await expectConcentric(container)
    })

    it('StyledEmojiChoice selected option', async () => {
        const { container } = mount(
            <StyledEmojiChoice
                dataTest='emoji'
                question='How was your week?'
                options={[
                    { value: 'bad', label: 'Bad', emoji: '🙁' },
                    { value: 'good', label: 'Good', emoji: '🙂' },
                ]}
                value='good'
            />,
        )
        await expectConcentric(container.querySelector('[data-testid="emoji-option-1"]')!)
    })
})

/**
 * The pixel check behind the bug. Device pixel ratios are the Windows display scales (125%–200%,
 * the report came from ~180%), and sub-pixel offsets move the radio off the pixel grid as a page
 * layout does. The ring and the dot centres are measured from the rendered PNG. A thin stroke and a
 * filled disc anti-alias differently, so even concentric shapes measure up to ~0.21 device px
 * apart here; the two-box radio reached 0.33 (small, ratio 1.8).
 */
const MAX_DOT_OFFSET_DEVICE_PX = 0.25

describe('the dot stays centred in the ring on screen (ASMA-8970)', () => {
    afterEach(async () => {
        await cdp().send('Emulation.clearDeviceMetricsOverride')
        cleanup()
    })

    const ink = (data: Uint8ClampedArray, i: number): number => (765 - data[i]! - data[i + 1]! - data[i + 2]!) / 765

    // Device pixels around the circle, captured at the emulated ratio (the vitest screenshot is CSS-scaled).
    const capture = async (svg: SVGSVGElement): Promise<ImageData> => {
        const frame = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 }
        const rect = svg.getBoundingClientRect()
        const margin = 4
        const { data } = await cdp().send('Page.captureScreenshot', {
            format: 'png',
            clip: {
                x: frame.left + rect.left - margin,
                y: frame.top + rect.top - margin,
                width: rect.width + margin * 2,
                height: rect.height + margin * 2,
                scale: 1,
            },
        })
        const image = new Image()
        image.src = `data:image/png;base64,${data}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')!
        context.drawImage(image, 0, 0)
        return context.getImageData(0, 0, image.width, image.height)
    }

    // Ink-weighted centres of the ring and the dot. The white gap between them splits the two; the
    // split radius is taken around the ring centre, refined from the centre of all ink.
    const measure = async (svg: SVGSVGElement, dpr: number, size: Size) => {
        const { data, width, height } = await capture(svg)
        const g = SIZES[size]
        const split = (g.dot + (g.size / 2 - g.stroke - g.dot) / 2) * dpr
        const pixels: { x: number; y: number; v: number }[] = []
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const v = ink(data, (y * width + x) * 4)
                if (v >= 0.05) pixels.push({ x: x + 0.5, y: y + 0.5, v })
            }
        }
        const centroid = (list: typeof pixels) => {
            const m = list.reduce((sum, p) => sum + p.v, 0)
            return { x: list.reduce((s, p) => s + p.v * p.x, 0) / m, y: list.reduce((s, p) => s + p.v * p.y, 0) / m, m }
        }
        let ring = centroid(pixels)
        let dot = ring
        for (let pass = 0; pass < 4; pass++) {
            const inner = pixels.filter((p) => Math.hypot(p.x - ring.x, p.y - ring.y) < split)
            const outer = pixels.filter((p) => Math.hypot(p.x - ring.x, p.y - ring.y) >= split)
            dot = centroid(inner)
            ring = centroid(outer)
        }
        return { image: { width, height }, dx: dot.x - ring.x, dy: dot.y - ring.y, dotInk: dot.m, ringInk: ring.m }
    }

    const DPRS = [1, 1.25, 1.5, 1.75, 1.8, 2]
    const OFFSETS = [0, 0.3, 0.5]
    const matrix = (['medium', 'small'] as const).flatMap((size) =>
        DPRS.flatMap((dpr) => OFFSETS.map((offset) => [size, dpr, offset] as const)),
    )

    it.each(matrix)('%s at devicePixelRatio %s, offset %spx', async (size, dpr, offset) => {
        await cdp().send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 720,
            deviceScaleFactor: dpr,
            mobile: false,
        })
        const { container } = mount(
            <div style={{ padding: 24, background: 'white', marginLeft: offset, marginTop: offset }}>
                <StyledRadio dataTest='r' size={size} checked />
            </div>,
        )
        const svg = radioSvgIn(container)
        // Past the dot's 0.5 s fade-in and the ring's 0.3 s colour transition.
        await new Promise((resolve) => setTimeout(resolve, 600))

        const m = await measure(svg, dpr, size)

        await expect(m.dotInk, 'the dot is painted').toBeGreaterThan(0)
        await expect(m.ringInk, 'the ring is painted').toBeGreaterThan(0)
        await expect(Math.abs(m.dx), `horizontal dot offset in device px (${JSON.stringify(m)})`).toBeLessThanOrEqual(
            MAX_DOT_OFFSET_DEVICE_PX,
        )
        await expect(Math.abs(m.dy), `vertical dot offset in device px (${JSON.stringify(m)})`).toBeLessThanOrEqual(
            MAX_DOT_OFFSET_DEVICE_PX,
        )
    })
})
