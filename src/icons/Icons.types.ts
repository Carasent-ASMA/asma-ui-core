export interface IIcon {
    width?: number
    height?: number
    className?: string
    onClick?: () => void
    color?: string
}
export interface IIconTemplate extends IIcon {
    icon: string
}
