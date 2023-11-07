import { Select, type SelectChangeEvent, type SelectProps } from '@mui/material'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { CloseIcon } from 'src/components/data-display/icons'

/**
 *
 * @usage
 * use StyleSelect only inside StyledFormControl
 * 
 * @size
 * control the size through StyledFormControl
 * 
 * @inputRef
 * inputRef to get Node of Input Element inside
 *
 */
export const StyledSelect: React.FC<
    SelectProps & {
        allowClear?: boolean
        dataTest: string
        dataId?: string
    }
> = ({ dataTest, dataId, allowClear, ...props }) => (
    <Select
        {...props}
        data-test={dataTest}
        data-id={dataId}
        value={props.value}
        IconComponent={(props) => (
            <Icon
                {...props}
                icon='material-symbols:expand-more-rounded'
                width={24}
                height={24}
                className={clsx(props.className, 'select-custom-icon')}
            />
        )}
        endAdornment={
            allowClear && props.value ? (
                <div
                    className='hover:bg-gama-100 duration-300 absolute right-8 p-[2px] rounded-full flex items-center justify-center'
                    onClick={() => {
                        props.onChange?.({ target: { value: '' } } as SelectChangeEvent<unknown>, null)
                    }}
                >
                    <CloseIcon width={18} height={18} />
                </div>
            ) : null
        }
        sx={{
            ...props.sx,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--colors-gama-500) !important',
            },
            '& .select-custom-icon': {
                marginTop: '-3.5px !important',
            },
        }}
    />
)
