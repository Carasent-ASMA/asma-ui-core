import type { FC, MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'

export type StyledLabelProps = {
    children: ReactNode
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    className?: string
    dataTest?: string
}

const StyledLabel: FC<StyledLabelProps> = ({ children, onClick, className, dataTest }) => {
    return (
        <div
            className={cn(
                'text-[10px] font-semibold  flex items-center justify-center w-fit uppercase h-4 px-1.5 py-0.5 rounded-[3px]  bg-gama-50 text-gama-700',
                className,
            )}
            onClick={onClick}
            data-test={dataTest}
        >
            {children}
        </div>
    )
}

export default StyledLabel
