import { LoadingIcon } from 'src/table/shared-components/LoadingIcon'
import style from './StyledTable.module.scss'

/* if component already has data, but refetching is active */

export const Fetching: React.FC<{ fetching?: boolean }> = ({ fetching = false }) => {
    return fetching ? (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/40'>
            <LoadingIcon className={style['loading-icon']} width={50} height={50} />
        </div>
    ) : null
}
