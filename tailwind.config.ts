import type { Config } from 'tailwindcss'
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
    plugins: [require('tailwind-scrollbar')],
} satisfies Config
