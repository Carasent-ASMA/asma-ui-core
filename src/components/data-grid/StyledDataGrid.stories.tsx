import { Icon } from '@iconify/react'
import { Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledDataGrid } from './StyledDataGrid'
import { StyledButton } from '../inputs/button/StyledButton'
import { StyledGridActionsCellItem } from './StyledGridActionsCellItem'

const meta = {
    title: 'DataGrid/Styled Data Grid',
    component: StyledDataGrid,
    tags: ['autodocs'],
    argTypes: {
        disableHeaderPin: { control: 'boolean', defaultValue: false },
        disableRowActions: { control: 'boolean', defaultValue: false },
    },
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
                        dataTest='test'
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
        disableColumnSelector: true,
        disableColumnFilter: true,
        disableDensitySelector: true,
        rowActions: (params) => {
            return [
                <StyledGridActionsCellItem
                    onClick={() => {
                        console.info('click', params)
                    }}
                    key='to-draft'
                    label='context menu item 1'
                    showInMenu
                />,
                <StyledGridActionsCellItem
                    onClick={() => {
                        console.info('click')
                    }}
                    key='item-2'
                    label='context menu item 2'
                    showInMenu
                />,
                <StyledGridActionsCellItem
                    onClick={() => {
                        console.info('click')
                    }}
                    key='item-3'
                    label='context menu item 3'
                    showInMenu
                />,
                <StyledGridActionsCellItem
                    onClick={() => {
                        console.info('click')
                    }}
                    key='item-4'
                    label='context menu item 4'
                    showInMenu
                />,
                <StyledGridActionsCellItem
                    onClick={() => {
                        console.info('click')
                    }}
                    key='item-5'
                    label='context menu item 5'
                    showInMenu
                />,
            ]
        },
        slots: {
            columnSortedAscendingIcon: () => <Icon icon={'mdi:menu-up'} />,
            columnSortedDescendingIcon: () => <Icon icon={'mdi:menu-down'} />,
        },
        disableHeaderPin: false,
        disableRowActions: false,
    },
} satisfies Meta<typeof StyledDataGrid>

export default meta

type Story = StoryObj<typeof meta>

export const DataGrid: Story = {
    args: meta.args,
    render: (args) => {
        return (
            <>
                <Stack mt={2} mb={4}>
                    <Typography variant='h6'>Standard DataGrid</Typography>
                    <StyledDataGrid
                        {...meta.args}
                        {...args}
                        checkboxSelection={false}
                        disableRowSelectionOnClick
                        hideFooter
                    />
                </Stack>
                <Stack mt={2}>
                    <Typography variant='h6'>DataGrid with checkboxSelection and footer</Typography>
                    <StyledDataGrid {...meta.args} {...args} />
                </Stack>
            </>
        )
    },
}
