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
            <div className='flex h-full w-full flex-wrap items-center gap-5 bg-gray-100 p-5 mt-2'>
                <Toaster />

                {icons.map((icon) => (
                    <Tippy content={icon?.name} interactive>
                        <div
                            className='cursor-pointer'
                            onClick={() => {
                                toast.success('Copied to clipboard')
                            }}
                        >
                            <CopyToClipboard text={icon?.clipboardText || ''}>{icon?.component}</CopyToClipboard>
                        </div>
                    </Tippy>
                ))}
            </div>
        </div>
    )
}
