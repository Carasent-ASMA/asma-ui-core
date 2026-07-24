import type { IFormLabelSize } from '../types'
import { StyledFormLabel } from '../components/StyledFormLabel'

export default {
    title: 'DataDisplay/FormLabel',
    component: StyledFormLabel,
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: DS typography (delta-700/-800) — md = Helper 14/20 Regular · base = Body Base Semibold 16/24 · lg = Section title 18/28 · xl = 20/28 SemiBold.',
            },
        },
    },
}

export const FormLabel = (): JSX.Element => (
    <>
        <div className='m-2.5 flex flex-col gap-2.5'>
            <StyledFormLabel size='md' title='Label-md' />
            <StyledFormLabel size='base' title='Label-base' />
            <StyledFormLabel size='xl' title='Label-xl' />
        </div>
    </>
)

// Full size matrix (all IFormLabelSize values) — the component's only variant axis.
const ALL_SIZES: IFormLabelSize[] = ['md', 'base', 'lg', 'xl']

export const Gallery = (): JSX.Element => (
    <div className='m-2.5 flex flex-col gap-2.5'>
        {ALL_SIZES.map((size) => (
            <StyledFormLabel key={size} size={size} title={`Label-${size}`} />
        ))}
    </div>
)
