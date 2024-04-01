import type { Meta } from '@storybook/react'

import { StyledLink } from './StyledLink'

const meta = {
    title: 'Navigation/Link',
    component: StyledLink,
    tags: [],
    args: { content: 'Base link', href: 'https://www.google.com' },
    argTypes: {
        size: {
            options: ['small', 'large'],
            control: { type: 'radio' },
        },
        disabled: {
            options: [true, false],
        },
    },
} satisfies Meta<typeof StyledLink>

export default meta

export const Link = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <StyledLink {...meta.args} />
            <StyledLink {...meta.args} disabled={true} />
            <StyledLink {...meta.args} title='Medium link' size='large' />
            <StyledLink {...meta.args} title='Medium link' disabled={true} size='large' />
        </div>
    )
}
