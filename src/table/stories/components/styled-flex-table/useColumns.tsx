import { useMemo } from 'react'

import type { ColumnDef } from '@tanstack/react-table'
import type { ITemplate } from '../../service/types'
import { CheckIcon } from 'src/table/shared-components/CheckIcon'

export const useColumns = (): { columns: ColumnDef<ITemplate, ITemplate>[] } => {
    const columns = useMemo<ColumnDef<ITemplate, ITemplate>[]>(
        () => [
            {
                accessorFn: (row) => row.id,
                id: 'favorite',
                enableHiding: false,
                enableSorting: false,
                header() {
                    return <CheckIcon color='#7a899e' width='20' />
                },
                cell() {
                    return <CheckIcon color={'#7a899e'} width='20' cursor={'pointer'} />
                },
                fixedLeft: true,
                minSize: 30,
                maxSize: 30,
                size: 30,
            },
            {
                accessorFn: (row) => row.template_uuid,
                id: 'uuid',
                header: 'Uuid',
                headerAlign: 'center',
                fixedLeft: true,
                cell: (info) => {
                    const proxy = info.row.original

                    return <div className='py-[12px] text-base text-black'>{`${proxy.template_uuid}`}</div>
                },
            },
            {
                accessorFn: (row) => row.title,
                id: 'title',
                header: 'Title',
                fixedLeft: true,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>
                                {proxy.title}
                                {proxy.title.length < 10 && proxy.template_uuid}
                                {proxy.title.length < 10 && proxy.template_uuid}
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.context,
                id: 'context',
                header: 'Context',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.context}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.archived,
                id: 'archived',
                header: 'Archived',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.archived ? 'true' : 'false'}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.updated_at,
                id: 'updated_at',
                header: 'Updated at',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.updated_at}</div>
                        </div>
                    )
                },
            },

            {
                accessorFn: (row) => row.id,
                id: 'id_2',
                enableHiding: false,
                enableSorting: false,
                header() {
                    return <CheckIcon color='#7a899e' width='20' />
                },
                cell() {
                    return <CheckIcon color={'#7a899e'} width='20' cursor={'pointer'} />
                },
                fixedLeft: false,
                minSize: 30,
                maxSize: 30,
                size: 30,
            },
            {
                accessorFn: (row) => row.template_uuid,
                id: 'uuid_2',
                header: 'Uuid',
                headerAlign: 'center',
                // minSize: 350,
                cell: (info) => {
                    const proxy = info.row.original

                    return <span className='text-base text-black'>{`${proxy.template_uuid}`}</span>
                },
            },
            {
                accessorFn: (row) => row.title,
                id: 'title_2',
                header: 'Title',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>
                                {proxy.title}
                                {proxy.title.length < 10 && proxy.template_uuid}
                                {proxy.title.length < 10 && proxy.template_uuid}
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.context,
                id: 'context_2',
                header: 'Context',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.context}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.archived,
                id: 'archived_2',
                header: 'Archived',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.archived ? 'true' : 'false'}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.updated_at,
                id: 'updated_at_2',
                header: 'Updated at',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.updated_at}</div>
                        </div>
                    )
                },
            },

            {
                accessorFn: (row) => row.id,
                id: 'id_3',
                enableHiding: false,
                enableSorting: false,
                header() {
                    return <CheckIcon color='#7a899e' width='20' />
                },
                cell() {
                    return <CheckIcon color={'#7a899e'} width='20' cursor={'pointer'} />
                },
                fixedLeft: false,
                minSize: 30,
                maxSize: 30,
                size: 30,
            },
            {
                accessorFn: (row) => row.template_uuid,
                id: 'uuid_3',
                header: 'Uuid',
                headerAlign: 'center',
                // minSize: 350,
                cell: (info) => {
                    const proxy = info.row.original

                    return <span className='text-base text-black'>{`${proxy.template_uuid}`}</span>
                },
            },
            {
                accessorFn: (row) => row.title,
                id: 'title_3',
                header: 'Title',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>
                                {proxy.title}
                                {proxy.title.length < 10 && proxy.template_uuid}
                                {proxy.title.length < 10 && proxy.template_uuid}
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.context,
                id: 'context_3',
                header: 'Context',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.context}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.archived,
                id: 'archived_3',
                header: 'Archived',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.archived ? 'true' : 'false'}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.updated_at,
                id: 'updated_at_3',
                header: 'Updated at',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.updated_at}</div>
                        </div>
                    )
                },
            },

            {
                accessorFn: (row) => row.id,
                id: 'id_4',
                enableHiding: false,
                enableSorting: false,
                header() {
                    return <CheckIcon color='#7a899e' width='20' />
                },
                cell() {
                    return <CheckIcon color={'#7a899e'} width='20' cursor={'pointer'} />
                },
                fixedLeft: false,
                minSize: 30,
                maxSize: 30,
                size: 30,
            },
            {
                accessorFn: (row) => row.template_uuid,
                id: 'uuid_4',
                header: 'Uuid',
                headerAlign: 'center',
                // minSize: 350,
                cell: (info) => {
                    const proxy = info.row.original

                    return <span className='text-base text-black'>{`${proxy.template_uuid}`}</span>
                },
            },
            {
                accessorFn: (row) => row.title,
                id: 'title_4',
                header: 'Title',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>
                                {proxy.title}
                                {proxy.title.length < 10 && proxy.template_uuid}
                                {proxy.title.length < 10 && proxy.template_uuid}
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.context,
                id: 'context_4',
                header: 'Context',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.context}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.archived,
                id: 'archived_4',
                header: 'Archived',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.archived ? 'true' : 'false'}</div>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => row.updated_at,
                id: 'updated_at_4',
                header: 'Updated at',
                fixedLeft: false,
                headerAlign: 'center',
                cell: (info) => {
                    const proxy = info.row.original
                    return (
                        <div className='py-[12px]' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ minWidth: 25, minHeight: 25 }}>
                                {/* <QnrIcon width={20} height={20} color='blue' /> */}
                            </div>
                            <div className='text-base text-black'>{proxy.updated_at}</div>
                        </div>
                    )
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
            //                 <div className='text-base text-black'>{proxy.lastName}</div>
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
            //                 <div className='text-base text-black'>{proxy.lastName}</div>
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
