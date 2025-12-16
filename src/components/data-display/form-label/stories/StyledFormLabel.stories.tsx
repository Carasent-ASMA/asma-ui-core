import { StyledFormLabel } from '../components/StyledFormLabel'

export default {
    title: 'DataDisplay/FormLabel',
    component: StyledFormLabel,
}

export const FormLabel = () => (
    <>
        <div className='m-2.5 flex flex-col gap-2.5'>
            <StyledFormLabel size='md' title='Label-md' />
            <StyledFormLabel size='base' title='Label-base' />
            <StyledFormLabel size='xl' title='Label-xl' />
        </div>
    </>
)
