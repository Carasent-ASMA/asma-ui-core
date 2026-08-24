import { describe, expect, it } from 'vitest'
import { blockingLeftEdge, type EdgeBox, helperRowMaxWidth } from './helperTextRoom'

const box = (left: number, top: number, width: number, height: number): EdgeBox => ({
    left,
    top,
    right: left + width,
    bottom: top + height,
})

const HELPER_BAND = box(100, 140, 160, 24)

describe('blockingLeftEdge', () => {
    it('reports no obstacle when the field stands alone', () => {
        expect(blockingLeftEdge(HELPER_BAND, [])).toBe(Number.POSITIVE_INFINITY)
    })

    it('stops short of a neighbour sharing the row, leaving a gutter', () => {
        expect(blockingLeftEdge(HELPER_BAND, [box(300, 100, 160, 80)])).toBe(292)
    })

    it('takes the nearest of several neighbours', () => {
        const neighbours = [box(600, 100, 100, 80), box(300, 100, 100, 80), box(450, 100, 100, 80)]

        expect(blockingLeftEdge(HELPER_BAND, neighbours)).toBe(292)
    })

    it('ignores neighbours on other rows — the message only spills sideways', () => {
        const above = box(300, 0, 160, 80)
        const below = box(300, 200, 160, 80)

        expect(blockingLeftEdge(HELPER_BAND, [above, below])).toBe(Number.POSITIVE_INFINITY)
    })

    it('ignores anything to the left of the field', () => {
        expect(blockingLeftEdge(HELPER_BAND, [box(0, 100, 80, 80)])).toBe(Number.POSITIVE_INFINITY)
    })

    it('ignores unrendered siblings', () => {
        expect(blockingLeftEdge(HELPER_BAND, [box(0, 0, 0, 0)])).toBe(Number.POSITIVE_INFINITY)
    })

    it('counts a neighbour that only clips the band edge', () => {
        const grazing = box(300, 160, 160, 80)

        expect(blockingLeftEdge(HELPER_BAND, [grazing])).toBe(292)
    })
})

describe('helperRowMaxWidth', () => {
    it('borrows the free space to the right, minus the row inset', () => {
        expect(helperRowMaxWidth(100, 160, 600)).toBe(486)
    })

    it('leaves the row alone when its parent ends at the field itself', () => {
        expect(helperRowMaxWidth(100, 160, 260)).toBeUndefined()
    })

    it('leaves the row alone however tight the limit', () => {
        expect(helperRowMaxWidth(100, 160, 120)).toBeUndefined()
        expect(helperRowMaxWidth(100, 160, Number.NEGATIVE_INFINITY)).toBeUndefined()
    })

    it('leaves the row alone when nothing bounds it at all', () => {
        expect(helperRowMaxWidth(100, 160, Number.POSITIVE_INFINITY)).toBeUndefined()
    })

    it('does not cap a field whose width comes from the row itself', () => {
        const rowNeeds = 86
        const fieldWidth = rowNeeds + 14
        const fieldLeft = 159

        expect(helperRowMaxWidth(fieldLeft, fieldWidth, fieldLeft + fieldWidth)).toBeUndefined()
    })

    it('reports unmeasured fields as undefined so no width style is applied', () => {
        expect(helperRowMaxWidth(0, 0, 600)).toBeUndefined()
    })
})
