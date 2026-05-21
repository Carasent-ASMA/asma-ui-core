import { LoadingIcon } from 'src/table/shared-components/LoadingIcon'
import style from './StyledTable.module.scss'

/* if component already has data, but refetching is active */

export const Fetching: React.FC<{ fetching?: boolean }> = ({ fetching = false }) => {
    return fetching ? (
        <div className='absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-white/40'>
            <LoadingIcon className={style['loading-icon']} width={50} height={50} />
        </div>
    ) : null
}
