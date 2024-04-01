import { useMemo } from 'react'

import type { ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import type { ITemplate } from '../../service/types'
import { QnrIcon } from 'src/components/icons'

export const useColumns = () => {
    const columns = useMemo<ColumnDef<ITemplate, ITemplate>[]>(
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
                maxSize: 30,
                size: 30,
            },
            {
                accessorFn: (row) => row.title,
                id: 'title',
                header: 'Title',
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                <QnrIcon width={20} height={20} color='blue' />
                            </div>
                            <div className='text-sm text-black'>
                                {proxy.title}
                                {proxy.title.length < 10 && proxy.template_uuid}
                                {proxy.title.length < 10 && proxy.template_uuid}
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.id,
                id: 'favorite-sucks',
                enableHiding: false,
                enableSorting: false,
                header() {
                    return <Icon icon={'mdi:star'} color='#7a899e' width='20' />
                },
                cell() {
                    return <Icon icon={'mdi:star-outline'} color={'#7a899e'} width='20' cursor={'pointer'} />
                },
                minSize: 30,
                maxSize: 30,
                size: 30,
            },
            {
                accessorFn: (row) => row.template_uuid,
                id: 'uuid',
                header: 'Uuid',
                headerAlign: 'center',
                // minSize: 350,
                cell: (info) => {
                    const proxy = info.row.original

                    return <span className='text-sm text-black'>{`${proxy.template_uuid}`}</span>
                },
            },
            // {
            //     accessorFn: (row) => row.lastName,
            //     id: 'lastName',
            //     header: 'Last Name',
            //     cell: (info) => {
            //         const proxy = info.row.original
            //         return (
            //             <div className='flex items-center gap-5'>
            //                 <div className='text-sm text-black'>{proxy.lastName}</div>
            //             </div>
            //         )
            //     },
            //     minSize: 100,
            // },
            // {
            //     accessorFn: (row) => row.id,
            //     id: 'multiheight-description',
            //     header: 'About Me',
            //     cell: (info) => {
            //         return <PersonDescriptionDiv cellContext={info} />
            //     },
            //     minSize: 100,
            // },
            // {
            //     accessorFn: (row) => row.id,
            //     id: 'description',
            //     header: 'About',
            //     cell: (info) => {
            //         return <PersonDescription cellContext={info} />
            //     },
            //     minSize: 100,
            //     size: NaN,
            // },
            // {
            //     accessorFn: (row) => row.lastName,
            //     id: 'lastNameX',
            //     header: 'Last Name',
            //     cell: (info) => {
            //         const proxy = info.row.original
            //         return (
            //             <div className='flex items-center gap-5'>
            //                 <div className='text-sm text-black'>{proxy.lastName}</div>
            //             </div>
            //         )
            //     },
            //     minSize: 100,
            // },
        ],
        [],
    )

    return { columns }
}

// const PersonDescription: React.FC<{ cellContext: CellContext<Person, Person> }> = () => {
//     return (
//         <div>
//             <input
//                 className='border-none pointer-events-none bg-transparent max-h-[40px] truncate w-full min-w-[120px] max-w-full'
//                 defaultValue={`Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy textLorem Ipsum is simply dummy textLorem Ipsum is simply dummy textLorem Ipsum is simply dummy textLorem Ipsum is simply dummy textLorem Ipsum is simply dummy text`}
//             />
//         </div>
//     )
// }

// const PersonDescriptionDiv: React.FC<{ cellContext: CellContext<Person, Person> }> = () => {
//     return <div className='min-w-[200px] w-fit'>Lorem Ipsum is simply dummy text is</div>
// }
