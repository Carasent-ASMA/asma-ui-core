import React from 'react'
import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const SettingsMenuHorizontalIcon: React.FC<IIcon> = ({
    width = 20,
    height = 20,
    className = '',
    onClick,
    color,
}) => {
    return (
        <IconTemplate
            icon='streamline:interface-setting-menu-1-button-parallel-horizontal-lines-menu-navigation-three-hamburger'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
