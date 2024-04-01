import { useMemo } from 'react'

import type { Person } from '../../helpers/makeData'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import { PersonIcon } from 'src/components/icons'

/**
 * Custom props:
 * @param size. use NaN (width 100%) only one time for the main column. It will make the column very responsive
 *
 */
export const useStyledTableColumns = () => {
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
                minSize: 30,
                size: 30,
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
                minSize: 100,
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
                minSize: 100,
            },
            {
                accessorFn: (row) => row.id,
                id: 'multiheight-description',
                header: 'About Me',
                cell: (info) => {
                    return <PersonDescriptionDiv cellContext={info} />
                },
                minSize: 100,
            },
            {
                accessorFn: (row) => row.id,
                id: 'description',
                header: 'About',
                cell: (info) => {
                    return <PersonDescription cellContext={info} />
                },
                minSize: 100,
                size: NaN,
            },
            {
                accessorFn: (row) => row.lastName,
                id: 'lastNameX',
                header: 'Last Name',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='flex items-center gap-5'>
                            <div className='text-sm text-black'>{proxy.lastName}</div>
                        </div>
                    )
                },
                minSize: 100,
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
        [],
    )

    return { columns }
}

const PersonDescription: React.FC<{ cellContext: CellContext<Person, Person> }> = () => {
    return (
        <div>
            <input
                className='border-none pointer-events-none bg-transparent max-h-[40px] truncate w-full min-w-[120px] max-w-full'
                defaultValue={`Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy textLorem Ipsum is simply dummy textLorem Ipsum is simply dummy textLorem Ipsum is simply dummy textLorem Ipsum is simply dummy textLorem Ipsum is simply dummy text`}
            />
        </div>
    )
}

const PersonDescriptionDiv: React.FC<{ cellContext: CellContext<Person, Person> }> = () => {
    return <div className='min-w-[200px] w-fit'>Lorem Ipsum is simply dummy text is</div>
}
