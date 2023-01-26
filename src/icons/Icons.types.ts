export interface IIcon {
    width?: number
    height?: number
    className?: string
    onClick?: () => void
}
export interface IIconTemplate extends IIcon {
    icon: string
}
