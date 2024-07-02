import { Icon } from '@iconify/react'
import { type IIconTemplate } from './Icons.types'

export const IconTemplate: React.FC<IIconTemplate> = ({
    width = 20,
    height = 20,
    className,
    icon,
    onClick,
    color,
    vFlip = false,
}) => {
    return (
        <Icon
            onClick={onClick}
            icon={icon}
            width={width}
            height={height}
            color={color}
            vFlip={vFlip}
            className={className}
        />
    )
}
