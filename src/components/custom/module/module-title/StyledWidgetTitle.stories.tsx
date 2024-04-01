import type { Meta } from '@storybook/react'
import { StyledModuleTitle } from './StyledModuleTitle'

const meta = {
    title: 'Modules/ModuleTitle',
    component: StyledModuleTitle,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledModuleTitle>

export default meta

export const ModuleTitle = () => {
    return (
        <div className='max-w-sm '>
            <StyledModuleTitle dataTest='anonyme-schema'>Anonyme skjema</StyledModuleTitle>
        </div>
    )
}
