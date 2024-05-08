import React, { useState } from 'react'
import type { Meta } from '@storybook/react'

import { StyledDialog } from '../StyledDialog'
import { StyledDialogActions } from '../StyledDialogActions'
import { StyledButton } from '../../../inputs/button/StyledButton'

const meta = {
    title: 'Feedback/Dialog',
    component: StyledDialog,
    tags: [],
    argTypes: {},
    args: {
        title: 'The dialog title (title)',
        open: true,
        fullScreen: false,

        onClose: () => {
            /*  */
        },
    },
} satisfies Meta<typeof StyledDialog>

export default meta

export const Dialog = () => {
    const [open, setOpen] = useState(true)

    const handleCloseDialog = () => {
        setOpen(false)
    }
    return (
        <React.Fragment>
            <StyledButton dataTest='test' onClick={() => setOpen(true)} variant='contained'>
                Open
            </StyledButton>
            <StyledDialog
                {...meta.args}
                PaperProps={{
                    sx: {
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        minHeight: '360px',
                        maxWidth: '680px',
                        width: '100%',
                        maxHeight: '80%',
                        height: '100%',
                    },
                }}
                onCloseText='Close'
                open={open}
                dataTest='test'
                onClose={handleCloseDialog}
                dialogLabel='Story about Liro (label)'
                dialogTitle='Story about Liro (title)'
            >
                <div
                    style={{
                        padding: 16,
                        fontSize: 20,
                        maxHeight: '100%',
                        overflow: 'auto',
                        scrollbarWidth: 'thin',
                    }}
                >
                    Once in a bustling city park, where the noise seldom dwindled, there lived a small, yet incredibly
                    vibrant bird named Liro. Unlike the other birds, Liro had feathers that shimmered in a kaleidoscope
                    of colors, sparkling under the sunlight like a gemstone. Liro, however, was not just known for his
                    striking appearance but also for his curious nature.
                    <br />
                    <br />
                    One sunny morning, while exploring a quiet alley, Liro stumbled upon a tiny, hidden garden
                    overflowing with wildflowers, a sight unseen by the city's busy inhabitants. The garden was like a
                    treasure trove, filled with insects buzzing and the sweet aroma of nectar, a paradise that Liro
                    decided to keep a secret between him and the blooms.
                    <br />
                    <br />
                    As days passed, Liro became the self-appointed guardian of this secret garden. He would perform
                    acrobatic flights to entertain the flowers, imagining them applauding in the gentle sway of their
                    stems. In return, the garden kept Liro's vibrant feathers dazzling, as if they were polished by the
                    petals themselves.
                    <br />
                    <br />
                    One day, a lonely, elderly artist named Marla discovered Liro dancing among the flowers. Mesmerized
                    by his beauty and the hidden garden's serenity, she began to paint, capturing the magic of the
                    moment. Liro, intrigued by her presence, would perch on her shoulder, watching his colors come to
                    life on her canvas.
                    <br />
                    <br />
                    The painting of Liro in the secret garden eventually made its way to a local gallery, enchanting
                    everyone who saw it. People began visiting the park in hopes of finding the mysterious garden with
                    the colorful bird. However, they were met with the ordinary sights of the park, as the garden
                    remained a secret, visible only to those who, like Liro and Marla, appreciated the beauty in hidden
                    places.
                    <br />
                    <br />
                    Liro’s story spread throughout the city, inspiring people to look closer at the world around them,
                    to find magic in the mundane. And though the secret garden remained a legend, the spirit of Liro’s
                    discovery reminded everyone that sometimes, the most extraordinary things are not meant to be shared
                    with the world, but cherished in the quiet moments of our lives.
                </div>
                <StyledDialogActions>
                    <StyledButton dataTest='test' variant='outlined' onClick={handleCloseDialog}>
                        Cancel
                    </StyledButton>
                    <StyledButton dataTest='test' variant='contained' onClick={handleCloseDialog}>
                        Save
                    </StyledButton>
                </StyledDialogActions>
            </StyledDialog>
        </React.Fragment>
    )
}
