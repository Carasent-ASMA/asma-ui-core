import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * ASMA-8137: the table renders core's button, checkbox and menu item, which emit `data-testid`. Apps whose
 * `testIdAttribute` is `data-test` still query these hooks, so the table keeps them.
 *
 * Complete consumer audit (2026-11-19), with file:line evidence: visual-tests/ASMA-8137.md.
 * Searched tests, e2e, Playwright configs and component code in editor (including its qnreditor
 * checkout), qnreditor, storage, crm, directory, calendar, chat, artifact, notification, shell and
 * advoca. Also verified the storage/CRM worktree specs cited by the original migration.
 * - cell-select: editor/qnreditor QuestionnaireTemplatePickerDialog.focus.test.tsx:168; storage
 *   PathwayDocumentPickerIndex.focus.test.tsx:151.
 * - expand-text-button: those picker specs (:125 / :163), plus editor/qnreditor
 *   ModuleTemplatePickerDialog.focus.test.tsx:162.
 * - row-actions-button: editor/qnreditor tests/pathways-template-lifecycle.spec.ts:34.
 * - reset-order-button: CRM OrganizationsTable.sorting.test.tsx:186.
 * No consumer queries select-all, pagination, column-settings/visibility, or datetime's migrated
 * button hooks. CRM's `close-button` is its own DeleteDialog button, not the calendar caption.
 * Keep this verified list explicit; add aliases and evidence here if another consumer is found.
 */
const verifiedLegacyHooks = ['cell-select', 'expand-text-button', 'row-actions-button', 'reset-order-button'] as const

const data = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
]
const columns: ColumnDef<(typeof data)[number]>[] = [{ accessorKey: 'name', header: 'Name' }]

const waitForElement = (selector: string): Promise<HTMLElement> =>
    waitFor(() => {
        const found = document.querySelector<HTMLElement>(selector)
        if (!found) throw new Error(`${selector} not rendered`)
        return found
    })

describe('StyledTable legacy data-test hooks (ASMA-8137)', () => {
    afterEach(cleanup)

    it('keeps data-test next to data-testid on the hooks other apps query', async () => {
        mount(
            <StyledTable
                data={data}
                columns={columns}
                locale='en'
                enableRowSelection
                textExpandArrow
                initialState={{ columnVisibility: { select: true } }}
                actions={() => [{ label: 'Edit', onClick: () => undefined }]}
            />,
        )

        await userEvent.click(await waitForElement('thead button[aria-haspopup="true"]'))
        await waitForElement('[data-testid="reset-order-button"]')

        for (const hook of verifiedLegacyHooks) {
            // Check every row, and that the legacy selector resolves to the same root elements:
            // a checkbox alias on its hidden input would not preserve the consumer contract.
            const elements = [...document.querySelectorAll(`[data-testid="${hook}"]`)]
            await expect(elements, hook).toHaveLength(hook === 'reset-order-button' ? 1 : data.length)
            await expect([...document.querySelectorAll(`[data-test="${hook}"]`)], hook).toEqual(elements)
        }
    })
})

describe('StyledTable row-action menu keyboard activation (ASMA-8137)', () => {
    afterEach(cleanup)

    it.each(['{Enter}', ' '])('%s runs the action once and closes the menu', async (key) => {
        const onEdit = fn()
        mount(<StyledTable data={data} columns={columns} locale='en' actions={() => [{ label: 'Edit', onClick: onEdit }]} />)

        await userEvent.click(await waitForElement('[data-testid="row-actions-button"]'))
        const item = await waitForElement('[role="menuitem"]')
        item.focus()
        await userEvent.keyboard(key)

        await expect(onEdit).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull())
    })
})
