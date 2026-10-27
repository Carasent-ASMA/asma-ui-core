import { StyledReadOnlyText } from './StyledReadOnlyText'

export default {
    title: 'DataDisplay/ReadOnlyText',
    component: StyledReadOnlyText,
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: Input field State=Read only (15977:29894) — label Body Base Semibold 16/24, 4px, value Body 16/24 delta-800; an empty value shows "-".',
            },
        },
    },
}

export const ReadOnlyText = (): JSX.Element => (
    <div className='m-2.5 flex w-80 flex-col gap-4'>
        <StyledReadOnlyText title='Pathway template name' value='Arbeidstrening 2026' />
        <StyledReadOnlyText title='Description' value='' />
        <StyledReadOnlyText title='Comment' value={'First line\nSecond line'} multiline />
        <StyledReadOnlyText value='Value without its own label' />
    </div>
)
