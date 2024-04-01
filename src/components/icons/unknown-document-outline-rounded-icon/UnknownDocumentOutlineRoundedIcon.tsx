import React from 'react'
import { IconTemplate } from '../IconTemplate'
import type { IIcon } from '../Icons.types'

export const UnknownDocumentOutlineRoundedIcon: React.FC<IIcon> = ({
    width = 20,
    height = 20,
    className = '',
    onClick,
    color,
}) => {
    return (
        <IconTemplate
            icon='material-symbols:unknown-document-outline-rounded'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
