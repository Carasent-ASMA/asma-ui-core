import type { Meta } from '@storybook/react-vite'

import ChevronDownIcon from 'src/components/custom/widget/icons/ChevronDownIcon'

import { StyledAIDisclosure } from '.'

import { InfoOutlineIcon } from 'node_modules/asma-ui-icons/dist'
import type { ReactNode } from 'node_modules/@types/react'

const TOOLTIP = 'Error message reworded for clarity. Meaning unchanged.'

const meta = {
    title: 'DataDisplay/AIDisclosure',
    component: StyledAIDisclosure,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Use the AI-disclosure component when AI has materially changed the meaning or form of a specific content block.',
            },
        },
    },
    args: {
        label: 'Simplified with AI',
        tooltip: TOOLTIP,
    },
    argTypes: {
        label: {
            control: 'text',
        },
        tooltip: {
            control: 'text',
        },
    },
} satisfies Meta<typeof StyledAIDisclosure>

export default meta

type DocumentationGridRow = {
    label: string
    content: ReactNode
    valueClassName?: string
}

function DocumentationGrid(props: {
    rows: DocumentationGridRow[]
    columnsClassName: string
    minRowHeightClassName?: string
}) {
    const { rows, columnsClassName, minRowHeightClassName = 'min-h-[100px]' } = props

    return (
        <div className={`grid border border-solid border-delta-200 bg-white ${columnsClassName}`}>
            {rows.map((row) => {
                return (
                    <div key={row.label} className='contents'>
                        <div
                            className={`flex ${minRowHeightClassName} items-center border-b border-solid border-delta-200 px-6 py-4 text-base leading-6 text-delta-600`}
                        >
                            <span>{row.label}</span>
                        </div>

                        <div
                            className={`flex ${minRowHeightClassName} border-b border-l border-solid border-delta-200 px-4 py-4 text-base leading-6 text-delta-600 ${row.valueClassName ?? 'items-center'}`}
                        >
                            {row.content}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function SectionTitle(props: { children: ReactNode }) {
    const { children } = props

    return <h2 className='text-2xl font-semibold leading-8 text-delta-600'>{children}</h2>
}

function WatermarkPreview() {
    return (
        <div className='flex select-none items-center justify-center rounded-xl border border-solid border-delta-700 px-1 py-[3px]'>
            <span className='[leading-trim:both] [text-edge:cap] text-[10px] font-semibold uppercase leading-[12px] tracking-[0.5px] text-delta-700'>
                AI
            </span>
        </div>
    )
}

function StaticDisclosurePreview(props: { label?: string; tooltip?: string; isOpen?: boolean }) {
    const { label, tooltip, isOpen = false } = props

    return (
        <div className='relative flex items-start overflow-visible px-1'>
            {isOpen && tooltip ? (
                <div className='absolute left-[33px] top-[-48px] z-10 flex w-[204px] flex-col items-start'>
                    <div className='rounded-[3px] bg-[#363E4A] px-2 py-1 text-xs leading-4 tracking-[0.24px] text-white shadow-[0_1px_6px_rgba(0,0,0,0.15)] whitespace-pre-line'>
                        {tooltip}
                    </div>

                    <div className='flex w-full px-4'>
                        <div className='h-0 w-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#363E4A]' />
                    </div>
                </div>
            ) : null}

            <div className='flex items-center gap-1 text-delta-700'>
                <WatermarkPreview />

                {label ? <span className='text-xs tracking-[0.24px]'>{label}</span> : null}

                {tooltip ? (
                    <ChevronDownIcon
                        className={`origin-center transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                        height={16}
                        width={16}
                    />
                ) : null}
            </div>
        </div>
    )
}

function GuidanceCard() {
    return (
        <section className='rounded-lg border border-solid border-[#8ED0D0] bg-[#E8F6F6] p-6 w-fit'>
            <div className='flex items-start gap-4'>
                <div>
                    <InfoOutlineIcon height={24} width={24} color='#168181' />
                </div>

                <div className='flex max-w-[500px] flex-col gap-6 text-base leading-6 text-delta-800'>
                    <div className='space-y-2'>
                        <h3 className='text-base font-semibold leading-6 m-0'>When to use</h3>

                        <p>
                            Use the AI-disclosure component whenever content has been created, modified, or simplified
                            by AI. Show it when:
                        </p>

                        <ul className='list-disc space-y-1 pl-5'>
                            <li>An error message or text has been reworded by AI for clarity</li>
                            <li>A document or response was generated by AI</li>
                            <li>Content was translated or summarised using AI</li>
                            <li>Any other AI action altered the meaning or form of content</li>
                        </ul>
                    </div>

                    <div className='space-y-2'>
                        <h3 className='text-base font-semibold leading-6 m-0'>When not to use</h3>
                        <p>
                            Do not use this component as a generic AI feature label or marketing badge. It should only
                            appear when AI has directly acted on a specific piece of content in context. Avoid showing
                            it on static UI elements that were not AI-processed.
                        </p>
                    </div>

                    <div className='space-y-2'>
                        <h3 className='text-base font-semibold leading-6 m-0'>Placement and alignment</h3>
                        <p>
                            The component is always aligned to the left edge of its container and placed at the bottom
                            of the content block it refers to, directly below the AI-processed text or element.
                        </p>
                    </div>

                    <a
                        className='w-fit text-base leading-6 text-[#168181] underline'
                        href='https://carbondesignsystem.com/guidelines/carbon-for-ai/'
                        rel='noreferrer'
                        target='_blank'
                    >
                        https://carbondesignsystem.com/guidelines/carbon-for-ai/
                    </a>
                </div>
            </div>
        </section>
    )
}

function RenderingVariantsGrid() {
    return (
        <DocumentationGrid
            columnsClassName='grid-cols-[290px_minmax(0,1fr)]'
            rows={[
                {
                    label: 'Icon only',
                    content: <StaticDisclosurePreview />,
                },
                {
                    label: 'Icon + label',
                    content: <StaticDisclosurePreview label='Simplified with AI' />,
                },
                {
                    label: 'Icon + label + chevron (collapsed)',
                    content: <StaticDisclosurePreview label='Simplified with AI' tooltip={TOOLTIP} />,
                },
                {
                    label: 'Icon + label + chevron (expanded)',
                    content: <StaticDisclosurePreview label='Simplified with AI' tooltip={TOOLTIP} isOpen />,
                    valueClassName: 'items-end overflow-visible pb-4 pt-2',
                },
            ]}
        />
    )
}

function DocumentationPage() {
    return (
        <div className='min-h-screen bg-white px-6 py-8 font-roboto md:px-10'>
            <div className='mx-auto flex max-w-[920px] flex-col gap-8'>
                <GuidanceCard />

                <section className='flex flex-col gap-4'>
                    <SectionTitle>Component structure</SectionTitle>

                    <DocumentationGrid
                        columnsClassName='grid-cols-[200px_minmax(0,1fr)]'
                        rows={[
                            {
                                label: 'AI icon (watermark)',
                                content: (
                                    <p>
                                        The anchor element. The component does not exist without it. Always visually
                                        identical.
                                    </p>
                                ),
                            },
                            {
                                label: 'Label text',
                                content: (
                                    <p>
                                        The icon can appear alone as a standalone watermark. When present, the verb slot
                                        changes by action type: &quot;Simplified&quot;, &quot;Generated&quot;,
                                        &quot;Translated&quot;, &quot;Reworded&quot;, etc. Pattern: [verb] with AI.
                                    </p>
                                ),
                            },
                            {
                                label: 'Chevron',
                                content: (
                                    <p>
                                        Only rendered when a tooltip exists. Flips direction on expand/collapse. No
                                        tooltip means no chevron.
                                    </p>
                                ),
                            },
                            {
                                label: 'Tooltip',
                                content: (
                                    <p>
                                        Fully dynamic. Human-readable explanation of what AI did and what was preserved.
                                    </p>
                                ),
                            },
                        ]}
                    />
                </section>

                <section className='flex max-w-[570px] flex-col gap-4'>
                    <SectionTitle>Rendering variants</SectionTitle>
                    <RenderingVariantsGrid />
                </section>
            </div>
        </div>
    )
}

export const Documentation = () => {
    return <DocumentationPage />
}

Documentation.parameters = {
    controls: {
        disable: true,
    },
}

export const AIDisclosure = () => {
    return (
        <div className='p-20'>
            <StyledAIDisclosure label='Simplified with AI' tooltip={TOOLTIP} />
        </div>
    )
}

export const RenderingVariants = () => {
    return (
        <div className='min-h-screen bg-white px-6 py-8 font-roboto'>
            <div className='max-w-[570px]'>
                <RenderingVariantsGrid />
            </div>
        </div>
    )
}

RenderingVariants.parameters = {
    controls: {
        disable: true,
    },
}
