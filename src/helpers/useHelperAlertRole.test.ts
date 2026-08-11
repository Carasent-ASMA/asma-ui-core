import { describe, expect, it } from 'vitest'
import { resolveHelperAlertRole } from './useHelperAlertRole'

/**
 * REQ-005 — error *appearance* announces via role="alert"; a field that stays invalid across
 * later renders must fall back to role="status" so it doesn't re-fire the live region on every
 * content swap (the ALT-002 "role=alert chatter" defect UX rejected at GATE-001).
 */
describe('resolveHelperAlertRole (REQ-005)', () => {
    it('announces alert on the render where an error first appears', () => {
        expect(resolveHelperAlertRole(true, false)).toBe('alert')
    })

    it('MUT: does not keep re-announcing alert while the field stays invalid across renders', () => {
        expect(resolveHelperAlertRole(true, true)).toBe('status')
    })

    it('stays status while the field is valid, regardless of prior state', () => {
        expect(resolveHelperAlertRole(false, false)).toBe('status')
        expect(resolveHelperAlertRole(false, true)).toBe('status')
    })

    it('re-announces alert if the error clears and then reappears', () => {
        expect(resolveHelperAlertRole(false, true)).toBe('status')
        expect(resolveHelperAlertRole(true, false)).toBe('alert')
    })
})
