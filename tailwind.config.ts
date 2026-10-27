import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import twConfigs from './tw-configs/twConfigs.json'

const boxShadow = twConfigs.boxShadow,
    animation = twConfigs.animation,
    keyframes = twConfigs.keyframes,
    fontFamily = twConfigs.fontFamily,
    width = twConfigs.width,
    maxWidth = twConfigs.maxWidth

export default {
    mode: 'jit',
    important: true,
    future: {
        // `hover:` / `group-hover:` only where a real pointer hovers (`(hover: hover) and (pointer:
        // fine)`), as Tailwind 4 does by default. On a touch screen the browser keeps an emulated
        // pointer at the last tap: when a picker or menu closed on a tap, the element underneath
        // took the hover style and kept it (ASMA-8468).
        hoverOnlyWhenSupported: true,
    },
    blocklist: ['rotate-180'],
    content: ['src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        fontFamily,
        extend: {
            colors: { ...twConfigs.colors },
            boxShadow,
            animation,
            keyframes,
            width,
            maxWidth,
        },
    },
    darkMode: 'media',
    corePlugins: {
        preflight: false,
    },
    plugins: [
        require('tailwind-scrollbar'),
        /* `max-xs:` — below xs (320px), narrower than any phone, e.g. a 320px window at 200% zoom
         * (WCAG 1.4.10, ASMA-8630).
         * - Strictly below 320px: `max-[320px]:` would also match 320px.
         * - Skips content inside table cells: tables scroll horizontally instead.
         * - `theme` layer: beats apps' `!important` utilities in the later `utilities` layer. */
        plugin(({ addVariant }) => {
            addVariant(
                'max-xs',
                "@layer theme { @media not all and (min-width: 320px) { &:not(:is(td, th, [role='cell'], [role='gridcell'], [role='columnheader'], [role='rowheader']) *) } }",
            )
        }),
    ],
} satisfies Config
