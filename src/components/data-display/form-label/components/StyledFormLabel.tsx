import clsx from 'clsx'
import { getStyles } from '../helpers/getStyles'
import type { IStyledFormLabel } from '../types'

export const StyledFormLabel: React.FC<IStyledFormLabel> = ({ title, onClick, className, dataTest, size = 'base' }) => {
    const styles = getStyles({ size })

    return (
        <div className={clsx(styles, className)} onClick={onClick} data-test={dataTest}>
            {title}
        </div>
    )
}
