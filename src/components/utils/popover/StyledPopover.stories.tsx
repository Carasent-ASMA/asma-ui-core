import React from 'react'
import type { Meta } from '@storybook/react'
import { StyledPopover } from './StyledPopover'
import { StyledButton, StyledTypography } from 'asma-core-ui'

const meta = {
    title: 'Utils/Styled Popover',
    component: StyledPopover,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledPopover>

export default meta

export const Popover = () => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <StyledButton dataTest='test' variant='contained' onClick={handleClick}>
                Open popover
            </StyledButton>

            <StyledPopover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <StyledTypography sx={{ p: 2 }}>The content of the Popover</StyledTypography>
            </StyledPopover>
        </>
    )
}

