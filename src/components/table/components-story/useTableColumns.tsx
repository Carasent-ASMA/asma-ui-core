import { useMemo } from 'react'

import type { Person } from '../makeData'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import { PersonIcon } from 'src/components/data-display/icons'

export const useStyledTableColumns = (isTablet: boolean) => {
    const columns = useMemo<ColumnDef<Person, Person>[]>(
        () => [
            {
                accessorFn: (row) => row.id,
                id: 'favorite',
                enableHiding: false,
                enableSorting: false,
                header() {
                    return <Icon icon={'mdi:star'} color='#7a899e' width='20' />
                },
                cell() {
                    return <Icon icon={'mdi:star-outline'} color={'#7a899e'} width='20' cursor={'pointer'} />
                },
            },
            {
                accessorFn: (row) => row.firstName,
                id: 'firstName',
                header: 'First Name',
                headerAlign: 'left',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='flex items-center gap-5'>
                            <PersonIcon width={20} height={20} />
                            <div className='text-sm text-black'>{proxy.firstName}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.lastName,
                id: 'lastName',
                header: 'Last Name',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='flex items-center gap-5'>
                            <div className='text-sm text-black'>{proxy.lastName}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.id,
                id: 'description',
                header: 'About',
                cell: (info) => {
                    return <PersonDescription cellContext={info} />
                },
                maxSize: isTablet ? 300 : 400,
            },

            // columnHelper.accessor('visits', {
            //     id: 'visits',
            //     header: 'Visits',
            //     size: 130,
            // }),
            // columnHelper.accessor('status', {
            //     id: 'status',
            //     header: 'Status',
            //     size: 150,
            // }),
            // columnHelper.accessor('progress', {
            //     id: 'progress',
            //     header: 'Progress',
            //     size: 100,
            // }),
            // columnHelper.display({
            //     id: 'share_action',
            //     enableHiding: false,
            //     cell: () => (
            //         <StyledButton dataTest='test' className='m-auto' type='button' variant='text'>
            //             Shared
            //         </StyledButton>
            //     ),
            // }),
        ],
        [isTablet],
    )

    return { columns }
}

const PersonDescription: React.FC<{ cellContext: CellContext<Person, Person> }> = () => {
    return (
        <div className='truncate'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
            electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of
            Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
            Aldus PageMaker including versions of Lorem Ipsum.
        </div>
    )
}
