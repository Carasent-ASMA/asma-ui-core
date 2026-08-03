import { describe, expect, it } from 'vitest'

import {
    floatingLabelLayoutStyle,
    SINGLE_LINE_FIELD_HEIGHT_PX,
    singleLineInputLayoutStyle,
    singleLineShellLayoutStyle,
} from './field-styles'

describe('single-line field layout — pinned against duplicate app CSS', () => {
    it('fixes the shell at 40px', () => {
        expect(singleLineShellLayoutStyle()).toEqual({
            boxSizing: 'border-box',
            height: SINGLE_LINE_FIELD_HEIGHT_PX,
            minHeight: SINGLE_LINE_FIELD_HEIGHT_PX,
            maxHeight: SINGLE_LINE_FIELD_HEIGHT_PX,
        })
    })

    it('zeros vertical padding on the input and keeps Figma horizontal insets', () => {
        expect(singleLineInputLayoutStyle()).toMatchObject({
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 14,
            paddingRight: 14,
            height: 40,
            lineHeight: '24px',
        })
    })

    it('anchors the floating label at the border or field centre', () => {
        expect(floatingLabelLayoutStyle(true)).toEqual({ top: 0, transform: 'translateY(-50%)' })
        expect(floatingLabelLayoutStyle(false)).toEqual({ top: '50%', transform: 'translateY(-50%)' })
    })
})
