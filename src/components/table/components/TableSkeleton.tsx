import { Skeleton } from '@mui/material'

export const TableSkeleton: React.FC<{ colSpan: number }> = ({ colSpan }) => {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                    <td colSpan={colSpan}>
                        <Skeleton key={index} variant='text' width='100%' height={50} />
                    </td>
                </tr>
            ))}
        </>
    )
}
