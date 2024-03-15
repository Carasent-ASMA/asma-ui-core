export const TableNoRowsOverlay: React.FC<{ colSpan: number; noRowsOverlay?: React.ReactNode }> = ({
    colSpan,
    noRowsOverlay,
}) => {
    return (
        <tr className='h-28'>
            <td colSpan={colSpan} className='text-center align-middle text-sm text-delta-900'>
                {noRowsOverlay}
            </td>
        </tr>
    )
}
