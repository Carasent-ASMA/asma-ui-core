import React from 'react'
import type { ComponentStory, ComponentMeta } from '@storybook/react'
// import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'

import { StyledBadge } from './StyledBadge'
import { Icon } from '@iconify/react'
import { Box, Link, Stack, Typography } from '@mui/material'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Data Display/Badge',

    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof StyledBadge>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof StyledBadge> = (args) => (
    <>
        <Box mb={2}>
            <Typography variant='h1'>Badge</Typography>
            <Typography variant='h2'>Primary color badge</Typography>
            <StyledBadge {...args}>
                <Icon icon='ic:baseline-email' className={'text-2xl'} />
            </StyledBadge>
        </Box>

        <Box mb={2}>
            <Typography variant='h2'>Secondary color badge</Typography>
            <StyledBadge {...args} color='secondary'>
                <Icon icon='ic:baseline-email' className={'text-2xl'} />
            </StyledBadge>
        </Box>

        <Box mb={2}>
            <Typography variant='h2'>Dot badge</Typography>
            <StyledBadge {...args} variant='dot'>
                <Icon icon='ic:baseline-email' className={'text-2xl'} />
            </StyledBadge>
        </Box>

        <Box mt={2}>
            <Link mt={2} href='https://mui.com/material-ui/react-badge/' target='_newWindo'>
                See full documentation at https://mui.com/material-ui/react-badge/
            </Link>
            <Typography>Also read documentation about accessibility</Typography>
        </Box>
    </>
)

export const Default = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
    badgeContent: 42,
}
