import React from 'react'
import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const TextBoxCheckOutlineIcon: React.FC<IIcon> = ({
    width = 20,
    height = 20,
    className = '',
    onClick,
    color,
}) => {
    return (
        <IconTemplate
            icon='mdi:text-box-check-outline'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
