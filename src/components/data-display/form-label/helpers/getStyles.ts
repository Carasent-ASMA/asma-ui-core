import type { IFormLabelSize } from '../types'
import styles from '../styles/StyledFormLabel.module.scss'
export const getStyles = ({ size }: { size: IFormLabelSize }): string | undefined => {
    switch (size) {
        case 'md':
            return styles['styled-label-md']
        case 'lg':
            return styles['styled-label-lg']
        case 'xl':
            return styles['styled-label-xl']
        default:
            return styles['styled-label-base']
    }
}
