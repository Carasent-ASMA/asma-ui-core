import { Icon } from '@iconify/react'
import { Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledDataGrid } from './StyledDataGrid'
import { StyledButton } from '../inputs/button/StyledButton'

const meta = {
    title: 'DataGrid/Styled Data Grid',
    component: StyledDataGrid,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        rows: [
            {
                id: 1,
                title: 'Utforskning av helse og helse erfaringer',
                description: 'Styrke kartlegging for nye deltakere',
                context: 'Kartlegging',
                deadline: '5 dager',
            },
            {
                id: 2,
                title: 'Start: Hvilke team ønsker du å utforske',
                description: 'Styrke kartlegging for nye deltakere',
                context: 'Kartlegging',
                deadline: '14 dager',
            },
        ],
        columns: [
            {
                field: 'prefixIcon',
                headerName: '',
                renderCell: () => (
                    <Icon icon='material-symbols:notes' className='text-gray-600' height='20' width='20' />
                ),
                width: 50,
                sortable: false,
            },
            { field: 'title', headerName: 'Title', flex: 2 },
            { field: 'description', headerName: 'Description', flex: 3 },
            { field: 'context', headerName: 'Context', flex: 1 },
            { field: 'deadline', headerName: 'Deadline', flex: 1 },
            {
                field: 'shared',
                headerName: 'Shared',
                renderHeader: () => <div />,
                renderCell: () => (
                    <StyledButton
                        type='button'
                        variant='text'
                        className='m-auto mt-2 flex w-fit justify-center bg-transparent'
                    >
                        Shared
                    </StyledButton>
                ),
                sortable: false,
            },
        ],
        fixedColumns: ['prefixIcon', 'shared'],
        checkboxSelection: true,
        disableColumnMenu: true,
        disableColumnSelector: true,
        disableColumnFilter: true,
        disableDensitySelector: true,
        slots: {
            columnSortedAscendingIcon: () => <Icon icon={'mdi:menu-up'} />,
            columnSortedDescendingIcon: () => <Icon icon={'mdi:menu-down'} />,
        },
    },
} satisfies Meta<typeof StyledDataGrid>

export default meta

type Story = StoryObj<typeof meta>

export const DataGrid: Story = {
    argTypes: meta.argTypes,
    render: () => (
        <>
            <Stack mt={2} mb={4}>
                <Typography variant='h1'>Standard DataGrid</Typography>
                <StyledDataGrid {...meta.args} checkboxSelection={false} disableRowSelectionOnClick hideFooter />
            </Stack>
            <Stack mt={2}>
                <Typography variant='h1'>DataGrid with checkboxSelection and footer</Typography>
                <StyledDataGrid {...meta.args} />
            </Stack>
        </>
    ),
}
