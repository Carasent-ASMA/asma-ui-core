import { Icon } from '@iconify/react'
import { Popover } from '@mui/material'
import { useState, type ReactNode, type JSXElementConstructor, type ReactElement } from 'react'
import { type GridActionsCellItemProps, type GridRowParams } from '@mui/x-data-grid'
import type { GridApiCommunity } from '@mui/x-data-grid/internals'
import { ColumnsMenu } from './ColumnsMenu'

export const columnActions = (
    apiRef: React.MutableRefObject<GridApiCommunity>,
    rowActions: (
        params: GridRowParams<any>,
    ) => ReactElement<GridActionsCellItemProps, string | JSXElementConstructor<any>>[],
    columnsMenuTitle: ReactNode,
) => {
    return {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.5,
        disableColumnMenu: true,
        sortable: false,
        type: 'actions',
        renderHeader: () => <RenderHeader apiRef={apiRef} columnsMenuTitle={columnsMenuTitle} />,
        getActions: rowActions || (() => []),
    }
}

const RenderHeader: React.FC<{ apiRef: React.MutableRefObject<GridApiCommunity>; columnsMenuTitle: ReactNode }> = ({
    apiRef,
    columnsMenuTitle,
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
    const open = Boolean(anchorEl)
    const id = open ? 'simple-popover' : undefined

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            <div
                className='flex cursor-pointer items-center justify-center'
                onClick={handleClick}
                aria-describedby={id}
            >
                <Icon icon={'mdi:pin'} color='#000' width={20} height={20} />
            </div>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <ColumnsMenu columnsMenuTitle={columnsMenuTitle} apiRef={apiRef} />
            </Popover>
        </>
    )
}
