import type { Meta } from '@storybook/react'

import { StyledButton } from './StyledButton'
import { Stack } from '@mui/material'
import { Icon } from '@iconify/react'
import { ChevronDownIcon } from 'src/components/data-display/icons'

const meta: Meta<typeof StyledButton> = {
    title: 'Inputs/Styled Button',
    component: StyledButton,
    tags: ['autodocs'],
    argTypes: {},
    args: { children: 'Button label' },
}

export default meta

export const Buttons = () => (
    <Stack direction='column' spacing={2}>
        <h2 className='text-gray-800 '>Buttons Common Enabled</h2>
        <CommonEnabledButtons />
        {/*  */}
        <h2 className='text-gray-800'>Buttons Common Disabled</h2>
        <CommonEnabledButtons disabled={true} />
        {/*  */}
        <h2 className='text-gray-800'>Buttons Common Size Small</h2>
        <CommonEnabledButtons size={'small'} />
        {/*  */}
        <h2 className='text-gray-800'>Buttons Common Size Small Disabled</h2>
        <CommonEnabledButtons size={'small'} disabled />
        {/*  */}
        <h2 className='text-gray-800'>Buttons Error Enabled</h2>
        <CommonEnabledButtons error />
        {/*  */}
        <h2 className='text-gray-800'>Buttons Error Disabled</h2>
        <CommonEnabledButtons error disabled />
        <h2 className='text-gray-800'>Buttons Error Size Small</h2>
        <CommonEnabledButtons size={'small'} error />
        {/*  */}
        <h2 className='text-gray-800'>Buttons Error Size Small Disabled</h2>
        <CommonEnabledButtons error size={'small'} disabled />
        {/*  */}
    </Stack>
)

const CommonEnabledButtons: React.FC<{
    disabled?: boolean
    size?: 'small' | 'large'
    error?: boolean
}> = ({ disabled = false, size = 'large', error = false }) => {
    const izSmall = size === 'small'
    return (
        <div>
            <div className='flex w-fit border border-b border-t-0 border-x-0 border-solid border-gray-200'>
                <div className='w-[100px] min-w-[100px] flex items-center  h-[50px] font-bold text-base text-gray-800'>
                    {izSmall ? 'Small' : 'Medium'}
                </div>
                <div className='w-[570px] flex min-w-[570px] items-center justify-center border-l-solid font-bold border-gray-200 text-gray-600'>
                    {disabled ? 'Disabled' : 'Enabled'}
                </div>
            </div>
            <div className='flex'>
                <div className='w-[100px] flex items-center text-gray-600 font-bold'>Contained</div>
                <div className='w-[570px] flex justify-center py-2  border border-l border-y-0 border-r-0 border-solid border-gray-200'>
                    <Stack direction='row' spacing={4}>
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='contained'
                        />
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='contained'
                            startIcon={
                                <Icon
                                    icon='mdi:filter-variant'
                                    className=''
                                    width={izSmall ? 20 : 24}
                                    height={izSmall ? 20 : 24}
                                />
                            }
                        >
                            <div>Button label</div>
                        </StyledButton>
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='contained'
                            endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                        />
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            variant='contained'
                            startIcon={
                                <Icon icon='mdi:filter-variant' width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />
                            }
                        />
                    </Stack>
                </div>
            </div>
            <div className='flex'>
                <div className='w-[100px] flex items-center h-[50px] text-gray-600 font-bold'>Outlined</div>
                <div className='w-[570px] flex justify-center py-2 border border-l border-y-0 border-r-0 border-solid border-gray-200'>
                    <Stack direction='row' spacing={4}>
                        <StyledButton error={error} size={size} disabled={disabled} {...meta.args} variant='outlined' />
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='outlined'
                            startIcon={
                                <Icon icon='mdi:filter-variant' width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />
                            }
                        />
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='outlined'
                            endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                        />
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            variant='outlined'
                            startIcon={
                                <Icon icon='mdi:filter-variant' width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />
                            }
                        />
                    </Stack>
                </div>
            </div>
            <div className='flex'>
                <div className='w-[100px] flex items-center h-[50px] text-gray-600 font-bold'>Text</div>
                <div className='w-[570px] flex justify-center py-2 border border-l border-y-0 border-r-0 border-solid border-gray-200'>
                    <Stack direction='row' spacing={4}>
                        <StyledButton error={error} size={size} disabled={disabled} {...meta.args} variant='text' />
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='text'
                            color='common'
                            startIcon={
                                <Icon icon='mdi:filter-variant' width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />
                            }
                        />
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='text'
                            endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                        />
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            variant='text'
                            startIcon={
                                <Icon icon='mdi:filter-variant' width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />
                            }
                        />
                    </Stack>
                </div>
            </div>
            {!error && (
                <div className='flex'>
                    <div className='w-[100px] flex items-center h-[50px] text-gray-600 font-bold'>Text Gray</div>
                    <div className='w-[570px] flex justify-center py-2 border border-l border-y-0 border-r-0 border-solid border-gray-200'>
                        <Stack direction='row' spacing={4}>
                            <StyledButton size={size} disabled={disabled} variant='textGray'>
                                Button label
                            </StyledButton>
                            <StyledButton
                                size={size}
                                disabled={disabled}
                                variant='textGray'
                                color='common'
                                startIcon={
                                    <Icon
                                        icon='mdi:filter-variant'
                                        width={izSmall ? 20 : 24}
                                        height={izSmall ? 20 : 24}
                                    />
                                }
                            >
                                Button label
                            </StyledButton>
                            <StyledButton
                                size={size}
                                disabled={disabled}
                                variant='textGray'
                                endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                            >
                                Button label
                            </StyledButton>
                            <StyledButton
                                size={size}
                                disabled={disabled}
                                variant='textGray'
                                startIcon={
                                    <Icon
                                        icon='mdi:filter-variant'
                                        width={izSmall ? 20 : 24}
                                        height={izSmall ? 20 : 24}
                                    />
                                }
                            ></StyledButton>
                        </Stack>
                    </div>
                </div>
            )}
        </div>
    )
}
