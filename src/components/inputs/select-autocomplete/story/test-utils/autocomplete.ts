import type { AriaRole } from 'react'
import { type UserEventObject } from 'storybook/test'

// NOTE: ts errors
// export const getAutocomplete = (canvasElement: HTMLElement) => {
//     const canvas = within(canvasElement.ownerDocument.body)
//     const input = canvas.getByRole('combobox')
//
//     return { canvas, input }
// }

export const openAutocomplete = async (input: HTMLElement, userEvent: UserEventObject): Promise<void> => {
    await userEvent.click(input)
}

export const selectOption = async (
    canvas: { findByRole: (role: AriaRole, opts: { name: string }) => Promise<HTMLElement> },
    userEvent: UserEventObject,
    name: string,
): Promise<void> => {
    const option = await canvas.findByRole('option', { name })
    await userEvent.click(option)
}
