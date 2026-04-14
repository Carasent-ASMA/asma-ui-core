import { Chip, type ChipProps } from '@mui/material'
import type React from 'react'
import { forwardRef } from 'react'
import { CloseIcon } from 'src/components/icons'

export type StyledChipProps = ChipProps & { dataTest: string; readOnly?: boolean }

export const StyledChip: React.FC<StyledChipProps> = forwardRef<HTMLDivElement, StyledChipProps>(
    ({ dataTest, readOnly, onDelete, ...props }, ref) => (
        <Chip
            {...props}
            ref={ref}
            data-test={dataTest}
            deleteIcon={readOnly ? undefined : <CloseIcon height={18} width={18} className='min-w-[18px]' />}
            onDelete={readOnly ? undefined : onDelete}
            sx={{
                ...{
                    border: '1px solid',
                    backgroundColor: 'white',
                    borderColor: 'var(--colors-delta-300)',
                    color: 'var(--colors-delta-800)',
                    fontSize: '14px',
                },
                ...(readOnly
                    ? {
                          pointerEvents: 'none',
                          '&:hover': {
                              borderColor: 'var(--colors-delta-300)',
                              backgroundColor: 'white',
                          },
                      }
                    : {
                          '&:hover': {
                              borderColor: 'var(--colors-gama-200)',
                              backgroundColor: 'var(--colors-gama-50)',
                          },
                          '&:focus': {
                              outline: 'none',
                              borderColor: 'var(--colors-gama-400)',
                              backgroundColor: 'var(--colors-gama-50)',
                              boxShadow: '0 0 0 1px inset var(--colors-gama-400)',
                          },
                          '&:active': {
                              borderColor: 'var(--colors-gama-400)',
                              backgroundColor: 'var(--colors-gama-50)',
                              boxShadow: '0 0 0 2px inset var(--colors-gama-400)',
                          },
                          '& .MuiChip-deleteIcon': {
                              border: '1px solid',
                              borderColor: 'var(--colors-delta-100)',
                              color: 'var(--colors-delta-700)',
                              backgroundColor: 'var(--colors-delta-50)',
                              borderRadius: '50%',
                              '&:hover': {
                                  borderColor: 'var(--colors-delta-100)',
                                  backgroundColor: 'var(--colors-delta-50)',
                                  color: 'var(--colors-delta-700)',
                              },
                          },
                      }),
                ...props.sx,
            }}
        />
    ),
)
