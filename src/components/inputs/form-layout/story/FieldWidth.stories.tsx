import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MinimizableDialogV2 } from 'src/components/feedback/minimizable-dialog/v2/MinimizableDialogV2'
import { StyledDatePicker } from 'src/datetime/components/date-picker'
import { StyledTimePicker } from 'src/datetime/components/time-picker'
import { StyledInputField } from '../../input-field/StyledInputField'
import { StyledSearchField } from '../../search-field/StyledSearchField'
import { StyledTextarea } from '../../textarea/StyledTextarea'
import { StyledFieldPair } from '../StyledFieldPair'
import { StyledFormColumn } from '../StyledFormColumn'

/**
 * The field width pattern (ASMA-8489): one column of at most 600 px, labels above the fields, and
 * each field Full or one of the steps XS 128, S 200 and M 320 px, chosen by its data.
 */
const meta: Meta<typeof StyledFormColumn> = {
    title: 'Inputs/Field Width',
    component: StyledFormColumn,
    parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof StyledFormColumn>

export const Steps: Story = {
    render: () => (
        <StyledFormColumn className='flex flex-col gap-4'>
            <StyledInputField dataTest='postal-code' label='Postnummer' width='xs' required />
            <StyledInputField dataTest='organisation-number' label='Organisasjonsnummer' width='s' required />
            <StyledInputField dataTest='iban' label='IBAN' width='m' />
            <StyledInputField dataTest='email' label='E-post' />
        </StyledFormColumn>
    ),
}

export const TypedFields: Story = {
    render: () => (
        <StyledFormColumn className='flex flex-col gap-4'>
            <StyledDatePicker mode='single' dataTest='date' title='Dato' selected={undefined} />
            <StyledTimePicker dataTest='time' title='Klokkeslett' onSelect={() => undefined} />
            <StyledTextarea dataTest='note' label='Notat' />
        </StyledFormColumn>
    ),
}

export const NarrowContainer: Story = {
    name: 'Narrow container (320 px)',
    render: () => (
        <div style={{ width: 320 }}>
            <StyledFormColumn className='flex flex-col gap-4'>
                <StyledInputField dataTest='iban' label='IBAN' width='m' />
                <StyledFieldPair>
                    <StyledInputField dataTest='postal-code' label='Postnummer' width='xs' />
                    <StyledInputField dataTest='city' label='Poststed' />
                </StyledFieldPair>
                <StyledFieldPair>
                    <StyledInputField dataTest='from' label='Fra' width='s' />
                    <StyledInputField dataTest='to' label='Til' width='s' />
                </StyledFieldPair>
            </StyledFormColumn>
        </div>
    ),
}

export const Pairs: Story = {
    render: () => (
        <StyledFormColumn className='flex flex-col gap-4'>
            <StyledFieldPair>
                <StyledInputField dataTest='first-name' label='Fornavn og mellomnavn' />
                <StyledInputField dataTest='last-name' label='Etternavn' />
            </StyledFieldPair>
            <StyledFieldPair>
                <StyledInputField dataTest='postal-code' label='Postnummer' width='xs' />
                <StyledInputField dataTest='city' label='Poststed' />
            </StyledFieldPair>
            <StyledFieldPair>
                <StyledDatePicker mode='single' dataTest='date' label='Dato' selected={undefined} />
                <StyledTimePicker dataTest='time' label='Klokkeslett' onSelect={() => undefined} />
            </StyledFieldPair>
            <StyledFieldPair>
                <StyledInputField dataTest='weight' label='Vekt' width='xs' />
                <StyledInputField dataTest='unit' label='Enhet' width='xs' />
            </StyledFieldPair>
            <StyledFieldPair legend='Telefon'>
                <StyledInputField dataTest='country-code' label='Landkode' width='xs' />
                <StyledInputField dataTest='phone-number' label='Telefonnummer' width='s' />
            </StyledFieldPair>
        </StyledFormColumn>
    ),
}

export const LabelPlacement: Story = {
    render: () => (
        <StyledFormColumn className='flex flex-col gap-4'>
            <StyledInputField dataTest='above' label='Fødselsnummer eller D-nummer' width='m' required />
            <StyledSearchField dataTest='search' label='Søk' />
        </StyledFormColumn>
    ),
}

const CounterField = (): JSX.Element => {
    const [title, setTitle] = useState('Oppfølging')
    const [note, setNote] = useState('')

    return (
        <StyledFormColumn className='flex flex-col gap-4'>
            <StyledInputField
                dataTest='title'
                label='Tittel'
                maxLength={100}
                counter
                locale='no'
                value={title}
                onChange={(event) => setTitle(event.target.value)}
            />
            <StyledTextarea
                dataTest='note'
                label='Notat'
                counter
                counterLimit={500}
                maxLength={500}
                locale='no'
                value={note}
                onChange={(event) => setNote(event.target.value)}
            />
        </StyledFormColumn>
    )
}

export const CharacterCounter: Story = {
    render: () => <CounterField />,
}

const FullScreenDialog = (): JSX.Element => {
    const [fullScreen, setFullScreen] = useState(true)

    return (
        <MinimizableDialogV2
            dataTest='note-dialog'
            open
            title='Notat'
            onClose={() => undefined}
            enableFullscreen
            showFullScreenIcon
            fullScreenState={fullScreen}
            handleFullScreenState={() => setFullScreen(!fullScreen)}
        >
            <div className='p-4'>
                <StyledFormColumn className='flex flex-col gap-4'>
                    <StyledFieldPair>
                        <StyledDatePicker mode='single' dataTest='date' label='Dato' selected={undefined} />
                        <StyledTimePicker dataTest='time' label='Klokkeslett' onSelect={() => undefined} />
                    </StyledFieldPair>
                    <StyledInputField dataTest='title' label='Tittel' />
                    <StyledTextarea dataTest='note' label='Notat' minRows={6} />
                </StyledFormColumn>
            </div>
        </MinimizableDialogV2>
    )
}

export const FullScreenMinimizableDialog: Story = {
    name: 'Full-screen minimizable dialog',
    render: () => <FullScreenDialog />,
}
