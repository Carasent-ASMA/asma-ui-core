export interface IIcon {
    width?: number
    height?: number
    className?: string
    onClick?: () => void
    color?: string
    vFlip?: boolean
}
export interface IIconTemplate extends IIcon {
    icon: string
}
