import React from 'react'
import { IconTemplate } from '../IconTemplate'
import type { IIcon } from '../Icons.types'

export const ErrorOutlineIcon: React.FC<IIcon> = ({
    width = 20,
    height = 20,
    className = '',
    onClick,
    color = 'var(--colors-error-500)',
}) => {
    return (
        <IconTemplate
            icon='mdi:error-outline'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
