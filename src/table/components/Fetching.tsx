import { LoadingIcon } from 'src/table/shared-components/LoadingIcon'
import style from './StyledTable.module.scss'

/* if component already has data, but refetching is active */

export const Fetching: React.FC<{ fetching?: boolean }> = ({ fetching = false }) => {
    return fetching ? (
        <div className='absolute z-10 bg-white/40 left-0 top-0 right-0 bottom-0 flex items-center justify-center '>
            <LoadingIcon className={style['loading-icon']} width={50} height={50} />
        </div>
    ) : null
}
