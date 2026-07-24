import { useState, type FC } from 'react'
import Tippy from '@tippyjs/react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import toast, { Toaster } from 'react-hot-toast'
import './tippy.css'

import { useIconsList } from './useIconsList'
import { StyledSearchField } from 'src/components/inputs/search-field'

export const StyledIcons: FC<{ height?: number; width?: number }> = ({ height = 28, width = 28 }) => {
    const [filterText, setFilterText] = useState('')
    const { icons } = useIconsList({ filterText, height, width })

    return (
        <div>
            <StyledSearchField
                dataTest='filter-icons'
                size='small'
                label='Filter icons'
                onChange={(e) => setFilterText(e.target.value)}
            />
            <div className='mt-2 flex h-full w-full flex-wrap items-center gap-5 bg-gray-100 p-5'>
                <Toaster />

                {icons.map((icon) => (
                    <Tippy content={icon?.name} interactive>
                        <button
                            type='button'
                            aria-label={icon?.name}
                            className='cursor-pointer border-0 bg-transparent'
                            onClick={() => {
                                toast.success('Copied to clipboard')
                            }}
                        >
                            <CopyToClipboard text={icon?.clipboardText || ''}>{icon?.component}</CopyToClipboard>
                        </button>
                    </Tippy>
                ))}
            </div>
        </div>
    )
}
