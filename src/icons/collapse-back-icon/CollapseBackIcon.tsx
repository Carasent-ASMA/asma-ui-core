import { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'
import styles from '../collpase-icon/CollapseIcon.module.scss'

export const CollapseBackIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    const iconWidth = width / 2
    return (
        <div className={styles['collapse-icon']} style={{ width, height }}>
            <IconTemplate
                icon='eva:arrow-ios-back-fill'
                width={iconWidth}
                height={height}
                className={className}
                onClick={onClick}
                color={color}
            />
            <IconTemplate
                icon='eva:arrow-ios-back-fill'
                width={iconWidth}
                height={height}
                className={className}
                onClick={onClick}
                color={color}
            />
        </div>
    )
}
