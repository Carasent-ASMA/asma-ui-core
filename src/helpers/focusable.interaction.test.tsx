import { describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { mount } from 'src/test-utils/renderInteraction'
import { firstTabbable, tabbableWithin } from './focusable'

/**
 * Pins the browser-computed contract: no tag list, so the guard is that the *behaviour* matches what
 * a real Tab press can reach — including the two cases a selector list could never see (hidden
 * subtrees and `disabled` fieldsets).
 */
describe('focusable helpers', () => {
    it('matches what Tab can actually reach, with no element list (2.1.1)', async () => {
        const { container } = mount(
            <div>
                <button data-k='button'>b</button>
                <button disabled>skip: disabled</button>
                <a data-k='link' href='#x'>a</a>
                <input data-k='input' />
                <input disabled />
                <select data-k='select'><option>o</option></select>
                <textarea data-k='textarea' />
                <div>skip: plain div</div>
                {/* Deliberately atypical markup — this fixture exists to prove the helper reads the
                    browser's own focusability rather than a tag list, so it has to contain the cases a
                    tag list gets wrong. */}
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                <span data-k='roving' tabIndex={0}>s</span>
                <span tabIndex={-1}>skip: roving -1</span>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio data-k='audio' controls />
                <div style={{ display: 'none' }}><button>skip: hidden</button></div>
                <fieldset disabled><button>skip: disabled fieldset</button></fieldset>
                {/* `inert` is inherited by the subtree but reported nowhere else: `tabIndex` stays 0,
                    the `inert` property is false on the descendant, and `checkVisibility()` is true
                    for a panel that is only clipped. Set imperatively because React 18 renders
                    `inert={true}` as nothing useful and `inert={false}` as `inert="false"`. */}
                <div ref={(node) => node?.toggleAttribute('inert', true)}><button>skip: inert</button></div>
            </div>,
        )

        const reached = tabbableWithin(container).map((el) => el.dataset['k'])
        await expect(reached).toEqual(['button', 'link', 'input', 'select', 'textarea', 'roving', 'audio'])
    })

    it('returns the root itself when the root is the control (4.1.2)', async () => {
        const { container } = mount(
            <>
                <button data-testid='bare'>b</button>
                <span data-testid='wrapper'>
                    <em>label</em>
                    <button data-testid='inner'>b</button>
                </span>
                <span data-testid='inert'>
                    <em>decorative only</em>
                </span>
            </>,
        )
        const at = (id: string): HTMLElement => container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!

        await expect(firstTabbable(at('bare'))).toBe(at('bare'))
        await expect(firstTabbable(at('wrapper'))).toBe(at('inner'))
        await expect(firstTabbable(at('inert'))).toBeNull()
    })
})
