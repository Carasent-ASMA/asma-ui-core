import type { MouseEventHandler, ReactNode } from 'react'

export type IFormLabelSize = 'md' | 'base' | 'lg' | 'xl'

export type IStyledFormLabel = {
    title: ReactNode
    onClick?: MouseEventHandler<HTMLDivElement>
    className?: string
    dataTest?: string
    size?: IFormLabelSize
}
