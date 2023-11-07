import type { Meta, StoryObj } from '@storybook/react'

import { StyledLink } from './StyledLink'

const meta = {
    title: 'Navigation/Styled Link',
    component: StyledLink,
    tags: ['autodocs'],
    args: { title: 'Base link', href: 'https://www.google.com' },
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

type Story = StoryObj<typeof StyledLink>

export const Link: Story = {
    args: {
        size: 'large',
        disabled: false,
    },
}

export const StyledLinkShowcase = () => {
    return (
        <div className='flex gap-10 items-center border-1 p-5'>
            <div className='flex flex-col gap-3 flex-shrink-0'>
                <StyledLink dataTest='link1' {...meta.args} />
                <StyledLink dataTest='link2' {...meta.args} disabled={true} />
                <StyledLink dataTest='link3' {...meta.args} title='Medium link' size='large' />
                <StyledLink dataTest='link4' {...meta.args} title='Medium link' disabled={true} size='large' />
            </div>
            <div className='flex flex-col gap-3'>
                <div className='flex justify-center font-semibold'>Example of inline usage</div>
                <div>
                    <p className='inline'>
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <StyledLink dataTest='link5' href='https://www.lipsum.com/' title='Click here' />
                    <p className='inline'>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                        mollit anim id est laborum."
                    </p>
                </div>
            </div>
        </div>
    )
}
