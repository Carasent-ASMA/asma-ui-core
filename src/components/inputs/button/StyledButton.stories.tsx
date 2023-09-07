import type { Meta } from '@storybook/react'

import { StyledButton } from './StyledButton'
import { Stack } from '@mui/material'
import { StyledTypography } from 'src/components/data-display/typography'
import { Icon } from '@iconify/react'
import { ChevronDownIcon } from 'src/components/data-display/icons'
import { StyledIconButton } from './StyledIconButton'

const meta: Meta<typeof StyledButton> = {
    title: 'Inputs/Styled Button',
    component: StyledButton,
    tags: ['autodocs'],
    argTypes: {},
    args: { children: 'Button label' },
}

export default meta

export const Buttons = () => (
    <>
        <Stack direction='column' spacing={2}>
            <StyledTypography variant='h6'>Common buttons</StyledTypography>

            <Stack direction='row' spacing={4}>
                {/* <StyledTypography variant='body1'>Contained (Primary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='contained' />
                <StyledButton {...meta.args} variant='contained'>
                    <Icon icon='mdi:filter-variant' width={24} height={24} />
                    Button label
                </StyledButton>
                <StyledButton {...meta.args} variant='contained'>
                    Button label
                    <ChevronDownIcon width={24} height={24} />
                </StyledButton>
                <StyledButton {...meta.args} disabled variant='contained' />
            </Stack>

            <Stack direction='row' mt={4} spacing={4}>
                {/* <StyledTypography variant='body1'>Outlined (Secondary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='outlined' />
                <StyledButton
                    {...meta.args}
                    variant='outlined'
                    startIcon={<Icon icon='mdi:filter-variant' width={24} height={24} />}
                />
                <StyledButton {...meta.args} variant='outlined' endIcon={<ChevronDownIcon width={24} height={24} />} />
                <StyledButton {...meta.args} disabled variant='outlined' />
            </Stack>

            <Stack direction='row' mt={4} spacing={4}>
                {/* <StyledTypography variant='body1'>Text (Tertiary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='text' />
                <StyledButton
                    {...meta.args}
                    variant='text'
                    startIcon={<Icon icon='mdi:filter-variant' width={24} height={24} />}
                />
                <StyledButton {...meta.args} variant='text' endIcon={<ChevronDownIcon width={24} height={24} />} />
                <StyledButton {...meta.args} disabled variant='text' />
            </Stack>

            <Stack direction='row' spacing={4} mt={4}>
                {/* <StyledTypography variant='body1'>Contained (Primary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='contained' size='small' />
                <StyledButton {...meta.args} variant='contained' size='small'>
                    <Icon icon='mdi:filter-variant' width={24} height={24} />
                    Button label
                </StyledButton>
                <StyledButton {...meta.args} variant='contained' size='small'>
                    Button label
                    <ChevronDownIcon width={24} height={24} />
                </StyledButton>
                <StyledButton {...meta.args} disabled variant='contained' size='small' />
            </Stack>

            <Stack direction='row' mt={4} spacing={4}>
                {/* <StyledTypography variant='body1'>Outlined (Secondary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='outlined' size='small' />
                <StyledButton
                    {...meta.args}
                    variant='outlined'
                    size='small'
                    startIcon={<Icon icon='mdi:filter-variant' width={24} height={24} />}
                />
                <StyledButton
                    {...meta.args}
                    variant='outlined'
                    size='small'
                    endIcon={<ChevronDownIcon width={24} height={24} />}
                />
                <StyledButton {...meta.args} disabled variant='outlined' size='small' />
            </Stack>

            <Stack direction='row' mt={4} spacing={4}>
                {/* <StyledTypography variant='body1'>Text (Tertiary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='text' size='small' />
                <StyledButton
                    {...meta.args}
                    variant='text'
                    size='small'
                    startIcon={<Icon icon='mdi:filter-variant' width={24} height={24} />}
                />
                <StyledButton
                    {...meta.args}
                    variant='text'
                    size='small'
                    endIcon={<ChevronDownIcon width={24} height={24} />}
                />
                <StyledButton {...meta.args} disabled variant='text' size='small' />
            </Stack>
        </Stack>

        <Stack direction='column' mt={2} spacing={2}>
            <StyledTypography variant='h6'>Danger buttons</StyledTypography>

            <Stack direction='row' spacing={4}>
                {/* <StyledTypography variant='body1'>Contained (Primary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='contained' color='error' />
                <StyledButton {...meta.args} variant='contained' color='error'>
                    <Icon icon='mdi:trash-can-outline' width={24} height={24} />
                    Button label
                </StyledButton>
                <StyledButton {...meta.args} variant='contained' color='error'>
                    Button label
                    <Icon icon='mdi:trash-can-outline' width={24} height={24} />
                </StyledButton>
                <StyledButton {...meta.args} disabled variant='contained' color='error' />
            </Stack>

            <Stack direction='row' mt={4} spacing={4}>
                {/* <StyledTypography variant='body1'>Outlined (Secondary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='outlined' color='error' />
                <StyledButton
                    {...meta.args}
                    variant='outlined'
                    color='error'
                    startIcon={<Icon icon='mdi:trash-can-outline' width={24} height={24} />}
                />
                <StyledButton
                    {...meta.args}
                    variant='outlined'
                    color='error'
                    endIcon={<Icon icon='mdi:trash-can-outline' width={24} height={24} />}
                />
                <StyledButton {...meta.args} disabled variant='outlined' color='error' />
            </Stack>

            <Stack direction='row' mt={4} spacing={4}>
                {/* <StyledTypography variant='body1'>Text (Tertiary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='text' color='error' />
                <StyledButton
                    {...meta.args}
                    variant='text'
                    color='error'
                    startIcon={<Icon icon='mdi:trash-can-outline' width={24} height={24} />}
                />
                <StyledButton
                    {...meta.args}
                    variant='text'
                    color='error'
                    endIcon={<Icon icon='mdi:trash-can-outline' width={24} height={24} />}
                />
                <StyledButton {...meta.args} disabled variant='text' color='error' />
            </Stack>

            <Stack direction='row' spacing={4} mt={4}>
                {/* <StyledTypography variant='body1'>Contained (Primary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='contained' size='small' color='error' />
                <StyledButton {...meta.args} variant='contained' size='small' color='error'>
                    <Icon icon='mdi:trash-can-outline' width={24} height={24} />
                    Button label
                </StyledButton>
                <StyledButton {...meta.args} variant='contained' size='small' color='error'>
                    Button label
                    <Icon icon='mdi:trash-can-outline' width={24} height={24} />
                </StyledButton>
                <StyledButton {...meta.args} disabled variant='contained' size='small' color='error' />
            </Stack>

            <Stack direction='row' mt={4} spacing={4}>
                {/* <StyledTypography variant='body1'>Outlined (Secondary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='outlined' size='small' color='error' />
                <StyledButton
                    {...meta.args}
                    variant='outlined'
                    size='small'
                    color='error'
                    startIcon={<Icon icon='mdi:trash-can-outline' width={24} height={24} />}
                />
                <StyledButton
                    {...meta.args}
                    variant='outlined'
                    size='small'
                    color='error'
                    endIcon={<Icon icon='mdi:trash-can-outline' width={24} height={24} />}
                />
                <StyledButton {...meta.args} disabled variant='outlined' size='small' color='error' />
            </Stack>

            <Stack direction='row' mt={4} spacing={4}>
                {/* <StyledTypography variant='body1'>Text (Tertiary) Medium</StyledTypography> */}
                <StyledButton {...meta.args} variant='text' size='small' color='error' />
                <StyledButton
                    {...meta.args}
                    variant='text'
                    size='small'
                    color='error'
                    startIcon={<Icon icon='mdi:trash-can-outline' width={24} height={24} />}
                />
                <StyledButton
                    {...meta.args}
                    variant='text'
                    size='small'
                    color='error'
                    endIcon={<Icon icon='mdi:trash-can-outline' width={24} height={24} />}
                />
                <StyledButton {...meta.args} disabled variant='text' size='small' color='error' />
            </Stack>
        </Stack>
    </>
)

export const ButtonChildren = () => (
    <Stack direction='row' useFlexGap flexWrap='wrap' spacing={4}>
        <StyledButton {...meta.args} variant='contained'>
            Single text child
        </StyledButton>
        <StyledButton {...meta.args} variant='contained'>
            <span>Single span child</span>
        </StyledButton>
        <StyledButton {...meta.args} variant='contained'>
            <div>Single div child</div>
        </StyledButton>
        <StyledButton {...meta.args} variant='contained'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
            <span>Span child with icon as sibling</span>
        </StyledButton>
        <StyledButton {...meta.args} variant='contained'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
            Text child with icon as sibling
        </StyledButton>
        <StyledButton {...meta.args} variant='contained'>
            <span>Span child with icon as sibling</span>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledButton>
        <StyledButton {...meta.args} variant='contained'>
            Text child with icon as sibling
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledButton>
        <StyledButton
            {...meta.args}
            variant='contained'
            endIcon={<Icon icon='mdi:filter-variant' width={24} height={24} />}
        >
            Text child with icon through prop
        </StyledButton>
        <StyledButton
            {...meta.args}
            variant='contained'
            endIcon={<Icon icon='mdi:filter-variant' width={24} height={24} />}
        >
            <span>Span child with icon through prop</span>
        </StyledButton>
    </Stack>
)

export const IconButtons = () => (
    <Stack direction='row' useFlexGap flexWrap='wrap' spacing={4}>
        <StyledIconButton variant='contained'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton variant='outlined'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton variant='text'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton color='error' variant='contained'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton color='error' variant='outlined'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton color='error' variant='text'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton disabled variant='contained'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton disabled variant='outlined'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton disabled variant='text'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton size='small' variant='contained'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton size='small' variant='outlined'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
        <StyledIconButton size='small' variant='text'>
            <Icon icon='mdi:filter-variant' width={24} height={24} />
        </StyledIconButton>
    </Stack>
)
