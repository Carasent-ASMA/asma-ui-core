import type { ReactNode } from "react"

export const StyledModuleTitle: React.FC<{dataTest:string, children:ReactNode}> = function StyledWidgetTitle(props) {
    return (
        <h1 data-test={props.dataTest} className='font-roboto md:mb-2 mb-5 text-2xl font-bold leading-10 text-[#17232E]'>
            {props.children}
        </h1>
    )
}
