import { Icon } from '@iconify/react'
import { Stack, Typography } from '@mui/material'
import { GridActionsCellItem } from '@mui/x-data-grid'
import type { ComponentMeta, ComponentStory } from '@storybook/react'
import { StyledDataGrid } from './StyledDataGrid'

export default { title: 'DataGrid' } as ComponentMeta<typeof StyledDataGrid>

const Template: ComponentStory<typeof StyledDataGrid> = (args) => (
    <>
        <Stack mt={2} mb={4}>
            <Typography variant='h1'>Standard DataGrid</Typography>
            <StyledDataGrid {...args} checkboxSelection={false} disableRowSelectionOnClick hideFooter />
        </Stack>
        <Stack mt={2}>
            <Typography variant='h1'>DataGrid with checkboxSelection and footer</Typography>
            <StyledDataGrid {...args} />
        </Stack>
    </>
)

export const Default = Template.bind({})
Default.args = {
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
        { field: 'title', headerName: 'Title', width: 200 },
        { field: 'description', headerName: 'Description', width: 200 },
        { field: 'context', headerName: 'Context', width: 200 },
        { field: 'deadline', headerName: 'Deadline', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 50,
            disableColumnMenu: true,
            sortable: false,
            type: 'actions',
            renderHeader: () => <Icon icon={'mdi:pin'} color='#000' width='20' />,
            getActions: () => [
                <GridActionsCellItem key='edit' label='Edit' icon={<Icon icon='mdi:pencil' />} showInMenu />,
                <GridActionsCellItem key='delete' label='Delete' icon={<Icon icon='mdi:delete' />} showInMenu />,
            ],
        },
    ],
    checkboxSelection: true,
    disableColumnMenu: true,
    disableColumnSelector: true,
    disableColumnFilter: true,
    disableDensitySelector: true,
    slots: {
        columnSortedAscendingIcon: () => <Icon icon={'mdi:menu-up'} />,
        columnSortedDescendingIcon: () => <Icon icon={'mdi:menu-down'} />,
    },
}
