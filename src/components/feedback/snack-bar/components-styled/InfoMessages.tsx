import { StyledButton } from 'src/components/inputs/button'
import { message } from '../message'
import { LoadingIcon } from 'src/components/icons'

export const InfoMessages: React.FC = () => {
    return (
        <div className='flex gap-2 flex-col bg-orange-100 p-5 rounded-md shadow-md'>
            <h2 className='m-auto'>
                message. <span className='text-blue-500'>info</span> | <span className='text-red-500'>error</span> |{' '}
                <span className='text-green-500'>loading</span>
            </h2>
            <StyledButton
                dataTest='click-me-for-info'
                onClick={() => message.info('You are awesome!!!', { autoHideDuration: 2000 })}
            >
                CLICK ME FOR INFO
            </StyledButton>
            <StyledButton
                error
                dataTest='click-me-for-info'
                onClick={() =>
                    message.error('Network Error', {
                        persist: true,
                        closeButton: true,
                    })
                }
            >
                CLICK ME FOR INFO ERROR
            </StyledButton>
            <StyledButton
                dataTest='click-me-for-info'
                onClick={() => {
                    const unListen = message.loading(
                        <div>
                            <div>Data is being uploaded now</div>
                        </div>,
                        {
                            id: crypto.randomUUID(),
                        },
                    )

                    setTimeout(() => {
                        unListen()
                    }, 2000)
                }}
            >
                <LoadingIcon width={24} height={24} /> LOADING CLICK ME FOR INFO
            </StyledButton>
        </div>
    )
}
