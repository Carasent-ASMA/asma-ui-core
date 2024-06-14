import style from '../StyledTable.module.scss'
export const TableNoRowsOverlay: React.FC<{ colSpan: number; noRowsOverlay?: React.ReactNode }> = ({
    colSpan,
    noRowsOverlay,
}) => {
    return (
        <tr className={style['no-rows-overlay']}>
            <td colSpan={colSpan}>{noRowsOverlay}</td>
        </tr>
    )
}
