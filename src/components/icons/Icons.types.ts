export interface IIcon {
    width?: number
    height?: number
    className?: string
    onClick?: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
    color?: string
    vFlip?: boolean
}
export interface IIconTemplate extends IIcon {
    icon: string
}
