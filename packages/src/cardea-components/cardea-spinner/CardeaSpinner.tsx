import { Icon } from '@iconify/react'

type ICardeaSpinnerSmall = {
    small?: boolean
    medium?: never
    big?: never
}

type ICardeaSpinnerMedium = {
    small?: never
    medium?: boolean
    big?: never
}

type ICardeaSpinnerBig = {
    small?: never
    medium?: never
    big?: boolean
}

type ICardeaSpinner = ICardeaSpinnerSmall | ICardeaSpinnerMedium | ICardeaSpinnerBig

export const CardeaSpinner: React.FC<ICardeaSpinner> = ({ small, big }) => {
    let width = 60
    let height = 60
    let outlineOffset = '-8px'

    if (small) {
        width = 40
        height = 40
        outlineOffset = '-6px'
    }
    if (big) {
        width = 72
        height = 72
        outlineOffset = '-10px'
    }

    return (
        <div
            className='animate-opacity-in  rounded-full outline outline-2 outline-offset-[-6px] outline-gray-200'
            style={{ width, height, outlineOffset }}
        >
            <Icon icon='mdi-light:loading' className='animate-spin text-gama-700' width={width} height={height} />
        </div>
    )
}
