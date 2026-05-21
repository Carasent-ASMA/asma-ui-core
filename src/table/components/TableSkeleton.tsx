import { Skeleton } from '@mui/material'
import { Fragment, type FunctionComponent } from 'react'

import styles from './TableSkeleton.module.scss'

export const TableSkeleton = (({ colSpan, rowHeight = 48 }) => (
    <Fragment>
        {Array.from({ length: 10 }).map((_, index) => (
            <tr key={index}>
                <td colSpan={colSpan} height={rowHeight} className={styles['skeleton-row']}>
                    <Skeleton
                        key={index}
                        variant={'rectangular'}
                        width={'100%'}
                        height={40}
                        sx={{ backgroundColor: 'var(--colors-delta-50)', borderRadius: '8px' }}
                    />
                </td>
            </tr>
        ))}
    </Fragment>
)) satisfies FunctionComponent<{ colSpan: number; rowHeight?: number }>
