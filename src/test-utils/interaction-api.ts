/**
 * The single input/assertion surface for the `interaction` project (ASMA-8139).
 *
 * `userEvent` comes from `vitest/browser`, NOT from `storybook/test`. That distinction is
 * load-bearing rather than stylistic: `storybook/test` re-exports `@testing-library/user-event`,
 * whose `tab()` computes the next focusable element itself, in JavaScript, from document order — so
 * it walks straight out of a native `<dialog>`'s focus trap and reports an escape that a real user
 * could never perform. The browser-context `userEvent` dispatches through Playwright/CDP, so Tab is
 * a real key press resolved by Chromium's own sequential-navigation algorithm, including the top
 * layer and `inert`. For a ticket whose whole subject is focus behaviour, only the real one counts.
 *
 * `expect` still comes from `storybook/test`, for the jest-dom matchers (`toHaveAccessibleName`,
 * `toHaveAttribute`, …) that the accessibility assertions are written against.
 */
export { expect, fn, waitFor, within } from 'storybook/test'
export { userEvent } from 'vitest/browser'
