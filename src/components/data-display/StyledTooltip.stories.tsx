import React from 'react'
import type { ComponentStory, ComponentMeta } from '@storybook/react'
// import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'

import { StyledTooltip } from './StyledTooltip'
import { Icon } from '@iconify/react'
import { Box, Link, Typography } from '@mui/material'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Data Display/Tooltip',

    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof StyledTooltip>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof StyledTooltip> = (args) => (
    <>
        <Box mb={2}>
            <Typography variant='h1'>Standard Tooltip</Typography>
            <StyledTooltip {...args}>
                <Icon icon='ic:baseline-email' className={'text-2xl'} />
            </StyledTooltip>
        </Box>

        <Box mt={2}>
            <Link mt={2} href='https://mui.com/material-ui/react-tooltip/' target='_newWindo'>
                See full documentation at https://mui.com/material-ui/react-tooltip/
            </Link>
            <Typography>Also read documentation about accessibility</Typography>
        </Box>
    </>
)

export const Default = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
    title: 'Tooltip',
}
