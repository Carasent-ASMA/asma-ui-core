import type { CSSProperties, FC, MouseEvent, ReactNode } from 'react'
import style from './StyledLabel.module.scss'
import clsx from 'clsx'

export type StyledLabelProps = {
    children: ReactNode
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    className?: string
    dataTest: string
    style?: CSSProperties
}
const styledLabelCss = style['styled-label']
export const StyledLabel: FC<StyledLabelProps> = ({ children, onClick, className, dataTest, style }) => {
    return (
        <div className={clsx(styledLabelCss, className)} style={style} onClick={onClick} data-test={dataTest}>
            {children}
        </div>
    )
}
