import type { Meta } from '@storybook/react-vite'
import { StyledModuleTitle } from './StyledModuleTitle'

const meta = {
    title: 'Modules/ModuleTitle',
    component: StyledModuleTitle,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: DS Page title typography — Roboto SemiBold 24/32, delta-800 (main page heading, once per page).',
            },
        },
    },
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledModuleTitle>

export default meta

export const ModuleTitle = (): JSX.Element => {
    return (
        <div className='max-w-sm'>
            <StyledModuleTitle dataTest='anonyme-schema'>Anonyme skjema</StyledModuleTitle>
        </div>
    )
}
