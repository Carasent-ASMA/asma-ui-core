/* eslint-disable react/no-unescaped-entities */
// Typography.stories.ts|tsx

import React from 'react'

import type { ComponentStory, ComponentMeta } from '@storybook/react'
import { Box, Typography } from '@mui/material'

export default {
    /* 👇 The title prop is optional.
     * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
     * to learn how to generate automatic titles
     */
    title: 'Data Display/Typography',
    component: Typography,
} as ComponentMeta<typeof Typography>

export const Default: ComponentStory<typeof Typography> = () => (
    <>
        <Box mb={4}>
            <Typography variant='h1'>MUI Typography variants</Typography>
            <Typography variant='h1'>H1 - Page title (variant="h1")</Typography>
            <Typography variant='h2'>H2 - Section title (variant="h2")</Typography>
            <Typography>Base - (variant="body", default)</Typography>
            <Typography variant='caption'>Caption - caption (variant="caption")</Typography>
        </Box>

        <Box mb={2}>
            <Typography variant='h1'>Tailwind Typography variants</Typography>

            <h1 className='text-h1'>H1 - Page title - (text-h1)</h1>
            <h2 className='text-h2'>H2 - Section title - (text-h2)</h2>
            <div className='text-base'>text-base (Standard no class)</div>
            <div className='text-small'>text-small (text-small)</div>
            <div className='text-xSmall'>text-xSmall (text-xSmall)</div>
        </Box>
    </>
)
