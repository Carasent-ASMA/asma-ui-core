import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledCheckbox as TableStyledCheckbox } from 'src/table/shared-components/StyledCheckbox'
import { StyledCheckbox } from './StyledCheckbox'

const CheckboxFixture = ({ table = false }: { table?: boolean }): JSX.Element => {
    const [checked, setChecked] = useState(false)
    const Checkbox = table ? TableStyledCheckbox : StyledCheckbox
    return (
        <>
            <StyledFormControlLabel
                label='Receive updates'
                control={<Checkbox dataTest='checkbox' checked={checked} onChange={(_, next) => setChecked(next)} />}
            />
            <StyledFormControlLabel label='Unavailable' control={<Checkbox dataTest='disabled-checkbox' disabled />} />
        </>
    )
}

describe.each([
    ['input', false],
    ['table', true],
] as const)('%s StyledCheckbox keyboard contract', (_copy, table) => {
    afterEach(cleanup)

    it('is named by its visible label, reached by Tab, and toggled by Space (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<CheckboxFixture table={table} />)
        const checkbox = container.querySelector<HTMLInputElement>('input:not([disabled])')!

        await expect(checkbox).toHaveAccessibleName('Receive updates')
        await userEvent.tab()
        await expect(document.activeElement).toBe(checkbox)
        await userEvent.keyboard(' ')
        await expect(checkbox).toBeChecked()
    })

    it('skips disabled controls in the Tab order (2.1.1)', async () => {
        const { container } = mount(<CheckboxFixture table={table} />)
        const enabled = container.querySelector<HTMLInputElement>('input:not([disabled])')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(enabled)
        await userEvent.tab()
        await expect(document.activeElement).toBe(document.body)
    })
})
