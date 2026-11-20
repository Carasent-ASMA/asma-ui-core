import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, waitFor } from 'storybook/test'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { UnsavedChangesDialog, type UnsavedChangesDialogProps } from './UnsavedChangesDialog'

type StoryArgs = Omit<UnsavedChangesDialogProps, 'onSave'> & {
    /** Story control: the version with save (the app passes `onSave`). */
    withSave: boolean
    onSave: () => void | Promise<unknown>
}

const meta = {
    title: 'Feedback/UnsavedChangesDialog',
    component: UnsavedChangesDialog,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: [
                    'Figma: [Unsaved changes](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=47548-220018).',
                    'The one unsaved-changes dialog for every app (ASMA-8895). The version **without save is the default**:',
                    'pass `onSave` only on the screens UX approved (workspaces, the questionnaire designer, document drafts).',
                    'ui-core owns every text. Focus starts on Keep editing; Escape, a click outside and browser Back keep editing.',
                    'The buttons stack only when they do not fit on one row.',
                ].join(' '),
            },
        },
    },
    argTypes: {
        withSave: { control: 'boolean' },
        saveLabel: { control: 'inline-radio', options: ['leave', 'refresh'] },
        locale: { control: 'inline-radio', options: ['en', 'no'] },
        pendingAction: { control: 'inline-radio', options: [undefined, 'save', 'delete'] },
    },
    args: {
        open: true,
        withSave: false,
        locale: 'en',
        onKeepEditing: fn(),
        onDelete: fn(),
        onSave: fn(),
    },
    render: ({ withSave, onSave, ...args }) => <UnsavedChangesDialog {...args} onSave={withSave ? onSave : undefined} />,
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

const expectFocusOnKeepEditing = async (label: string): Promise<void> => {
    await waitFor(() => expect(screen.getByRole('button', { name: label })).toHaveFocus())
}

/** Default: no save. "Delete changes?" with [Delete changes] … [Keep editing]. */
export const WithoutSave: Story = {
    play: async () => {
        await expect(await screen.findByRole('dialog', { name: 'Delete changes?' })).toBeInTheDocument()
        await expectFocusOnKeepEditing('Keep editing')
    },
}

export const WithoutSaveNorwegian: Story = {
    args: { locale: 'no' },
    play: async () => {
        await expect(await screen.findByRole('dialog', { name: 'Slette endringene?' })).toBeInTheDocument()
        await expectFocusOnKeepEditing('Fortsett å redigere')
    },
}

/** Only where UX approved save: "Save changes?" with [Delete changes] … [Keep editing] [Save and leave]. */
export const WithSave: Story = {
    args: { withSave: true },
    play: async () => {
        await expect(await screen.findByRole('dialog', { name: 'Save changes?' })).toBeInTheDocument()
        await expectFocusOnKeepEditing('Keep editing')
    },
}

export const WithSaveNorwegian: Story = {
    args: { withSave: true, locale: 'no' },
    play: async () => {
        await expect(await screen.findByRole('dialog', { name: 'Lagre endringene?' })).toBeInTheDocument()
        await expectFocusOnKeepEditing('Fortsett å redigere')
    },
}

/** Refreshing a workspace questionnaire: the one exception to "Save and leave". */
export const SaveAndRefresh: Story = {
    args: { withSave: true, saveLabel: 'refresh' },
}

/** A small screen: 100vw − 32 px; the buttons do not fit on one row, so they stack in the desktop order. */
export const WithoutSaveMobile: Story = {
    globals: { viewport: { value: 'mobile1', isRotated: false } },
}

export const WithSaveMobile: Story = {
    args: { withSave: true },
    globals: { viewport: { value: 'mobile1', isRotated: false } },
}

export const WithSaveMobileNorwegian: Story = {
    args: { withSave: true, locale: 'no' },
    globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Save running: Save and leave is busy; Delete changes and Keep editing wait with "Wait until saved". */
export const Saving: Story = {
    args: { withSave: true, pendingAction: 'save' },
}

/** Delete running: Delete changes is busy; the others wait with "Wait until deleted". */
export const Deleting: Story = {
    args: { withSave: true, pendingAction: 'delete' },
}

/**
 * How an app wires it: leaving opens the dialog; Keep editing closes it; Delete changes and Save and
 * leave return a Promise, so their button is busy until it settles. A failed save keeps the user on
 * the page: the app closes the dialog and moves focus to the problem.
 */
export const Playground: Story = {
    args: { open: false, withSave: true },
    render: function PlaygroundStory({ withSave, locale, saveLabel }) {
        const [open, setOpen] = useState(false)
        const [log, setLog] = useState('Edit something, then leave.')
        const wait = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms))
        return (
            <div className='flex flex-col items-start gap-4 p-6'>
                <StyledButton dataTest='leave' variant='outlined' onClick={() => setOpen(true)}>
                    Leave the page
                </StyledButton>
                <p className='m-0 text-delta-700'>{log}</p>
                <UnsavedChangesDialog
                    open={open}
                    locale={locale}
                    saveLabel={saveLabel}
                    onKeepEditing={() => {
                        setOpen(false)
                        setLog('Kept editing.')
                    }}
                    onDelete={async () => {
                        await wait(1200)
                        setOpen(false)
                        setLog('Changes deleted; the user left.')
                    }}
                    onSave={
                        withSave
                            ? async () => {
                                  await wait(1200)
                                  setOpen(false)
                                  setLog('Saved; the user left.')
                              }
                            : undefined
                    }
                />
            </div>
        )
    },
}
