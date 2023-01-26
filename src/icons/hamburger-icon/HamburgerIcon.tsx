import { IconTemplate } from '../IconTemplate'

export const HamburgerIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({
    width = 20,
    height = 20,
    className = '',
}) => {
    return <IconTemplate icon='charm:menu-hamburger' width={width} height={height} className={className} />
}
