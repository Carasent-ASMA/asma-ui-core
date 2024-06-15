import type { Meta } from '@storybook/react'

import { StyledButton } from './StyledButton'
import { Stack } from '@mui/material'
import { Icon } from '@iconify/react'
import { ChevronDownIcon } from 'src/components/icons'
import style from './StyledButtonStories.module.scss'

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
        <h2 className={style['header']}>Buttons Common Enabled</h2>
        <CommonEnabledButtons />
        {/*  */}
        <h2 className={style['header']}>Buttons Common Disabled</h2>
        <CommonEnabledButtons disabled={true} />
        {/*  */}
        <h2 className={style['header']}>Buttons Common Size Small</h2>
        <CommonEnabledButtons size={'small'} />
        {/*  */}
        <h2 className={style['header']}>Buttons Common Size Small Disabled</h2>
        <CommonEnabledButtons size={'small'} disabled />
        {/*  */}
        <h2 className={style['header']}>Buttons Error Enabled</h2>
        <CommonEnabledButtons error />
        {/*  */}
        <h2 className={style['header']}>Buttons Error Disabled</h2>
        <CommonEnabledButtons error disabled />
        <h2 className={style['header']}>Buttons Error Size Small</h2>
        <CommonEnabledButtons size={'small'} error />
        {/*  */}
        <h2 className={style['header']}>Buttons Error Size Small Disabled</h2>
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
        <div className={style['buttons-module']}>
            <div className={style['buttons-module__table-borders']}>
                <div className={style['buttons-module__table-header-button-type']}>{izSmall ? 'Small' : 'Medium'}</div>
                <div className={style['buttons-module__table-header-button-state']}>{disabled ? 'Disabled' : 'Enabled'}</div>
            </div>
            <div className={style['buttons-module__table-row']}>
                <div className={style['buttons-module__text']}>Contained</div>
                <div className={style['buttons-module__table-row-borders']}>
                    <Stack direction='row' spacing={4}>
                        <StyledButton
                            dataTest='test'
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='contained'
                        />
                        <StyledButton
                            dataTest='test'
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
                            dataTest='test'
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='contained'
                            endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                        />
                        <StyledButton
                            dataTest='test'
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
            <div className={style['buttons-module__table-row']}>
                <div className={style['buttons-module__text']}>Outlined</div>
                <div className={style['buttons-module__table-row-borders']}>
                    <Stack direction='row' spacing={4}>
                        <StyledButton
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='outlined'
                            dataTest='test'
                        />
                        <StyledButton
                            dataTest='test'
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
                            dataTest='test'
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='outlined'
                            endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                        />
                        <StyledButton
                            dataTest='test'
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
            <div className={style['buttons-module__table-row']}>
                <div className={style['buttons-module__text']}>Text</div>
                <div className={style['buttons-module__table-row-borders']}>
                    <Stack direction='row' spacing={4}>
                        <StyledButton
                            dataTest='test'
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='text'
                        />
                        <StyledButton
                            dataTest='test'
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
                            dataTest='test'
                            error={error}
                            size={size}
                            disabled={disabled}
                            {...meta.args}
                            variant='text'
                            endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                        />
                        <StyledButton
                            dataTest='test'
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
                <div className={style['buttons-module__table-row']}>
                    <div className={style['buttons-module__text']}>Text Gray</div>
                    <div className={style['buttons-module__table-row-borders']}>
                        <Stack direction='row' spacing={4}>
                            <StyledButton dataTest='test' size={size} disabled={disabled} variant='textGray'>
                                Button label
                            </StyledButton>
                            <StyledButton
                                dataTest='test'
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
                                dataTest='test'
                                size={size}
                                disabled={disabled}
                                variant='textGray'
                                endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                            >
                                Button label
                            </StyledButton>
                            <StyledButton
                                dataTest='test'
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
            {!error && (
                <div className={style['buttons-module__table-row']}>
                    <div className={style['buttons-module__text']}>Text White</div>
                    <div className={style['buttons-module__table-row-borders']}>
                        <Stack direction='row' spacing={4}>
                            <StyledButton dataTest='test' size={size} disabled={disabled} variant='textWhite'>
                                Button label
                            </StyledButton>
                            <StyledButton
                                dataTest='test'
                                size={size}
                                disabled={disabled}
                                variant='textWhite'
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
                                dataTest='test'
                                size={size}
                                disabled={disabled}
                                variant='textWhite'
                                endIcon={<ChevronDownIcon width={izSmall ? 20 : 24} height={izSmall ? 20 : 24} />}
                            >
                                Button label
                            </StyledButton>
                            <StyledButton
                                dataTest='test'
                                size={size}
                                disabled={disabled}
                                variant='textWhite'
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
