const twConfigs = require('./tailwind-configs/tw_configs.cjs')
const defaultConfig = require('tailwindcss/defaultConfig')

// if you use any key-pair from tailwind.config.js wrap the style in module!
module.exports = {
    mode: 'jit',
    content: ['index.html', 'src/**/*.{ts, tsx}'],
    theme: {
        fontFamily: {
            sans: ['Source Sans Pro', defaultConfig.theme.fontFamily.sans],
        },
        extend: {
            // do not create "black" "white", it affects headless ui components
            colors: {
                ...twConfigs.colors,

                //  // // // //

                //  // // // // // //
                // Calendar colors //
                //  // // // // // //

                'custom-ft-light-green': 'var(--color-custom-ft-light-green)',

                'button-primary-background': 'var(--button-primary-background-color)',
                'button-primary-text': 'var(--button-primary-text-color)',

                'button-default-background': 'var(--button-default-background-color)',
                'button-default-border': 'var(--button-default-border-color)',
                'button-default-text': 'var(--button-default-text-color)',

                'modal-overlay-background': 'var(--modal-overlay-background-color)',
                'modal-toolbar-background': 'var(--modal-toolbar-background-color)',
                'modal-toolbar-text': 'var(--modal-toolbar-text-color)',
                'modal-content-background': 'var(--modal-content-background-color)',

                'old-green-light': 'hsl(var(--color-old-green-light) / <alpha-value>)',
                'green-06': 'var(--color-green-06)',
                'green-05': 'var(--color-green-05)',
                'green-04': 'var(--color-green-04)',
                'green-03': 'var(--color-green-03)',
                'green-02': 'var(--color-green-02)',
                'green-01': 'var(--color-green-01)',
                // ---
                'blue-light': 'var(--color-blue-light)',
                'blue-basic': 'var(--color-blue-basic)',
                // ---
                'gray-draker-alt-secondary': 'var(--color-gray-draker-alt-secondary)',
                'gray-darker-alt': 'var(--gray-darker-alt)',
                'gray-darker': 'var(--color-gray-darker)',
                'gray-dark': 'var(--color-gray-dark)',
                'gray-primary': 'var(--color-gray-primary)',
                'gray-lighter': 'var(--color-gray-lighter)',
                'gray-lightest': 'var(--color-gray-lightest)',
                // ---
                'lavender-basic': '#dcd9e6',
                // ----
                'orange-basic': '#FF8400',
                // ----
                'pink-light': '#f2d5f6',
                'pink-basic': '#ca86d3',
                // ---
                lead: '#222222',
                'custom-red-darkest': 'hsl(var(--color-custom-red-darkest) / <alpha-value>)',
                'custom-red-dark': 'hsl(var(--color-custom-red-dark) / <alpha-value>)',
                'custom-text-color': 'hsl(var(--color-custom-text) / <alpha-value>)',

                'custom-grey-01': 'hsl(var(--color-custom-grey-01) / <alpha-value>)',
                'custom-grey-02': 'hsl(var(--color-custom-grey-02) / <alpha-value>)',
                'custom-grey-03': 'var(--color-custom-grey-03)',
                'custom-grey-04': 'var(--color-custom-grey-04)',
                'custom-grey-06': 'hsl(var(--color-custom-grey-06) / <alpha-value>)',
                'custom-dark-grey': 'hsl(var(--color-custom-dark-grey) / <alpha-value>)',

                'custom-gray-95': 'hsl(var(--color-gray-95) / <alpha-value>)',
                'custom-light-green': 'hsl(var(--color-custom-light-green) / <alpha-value>)',
                'custom-dark-green': 'hsl(var(--color-custom-dark-green) / <alpha-value>)',
                'custom-blue-10': 'hsl(var(--color-custom-blue-10) / <alpha-value>)',

                //
                'gray-01': '#F0F2F4',
                'gray-04': '#98A3B4',
            },

            minHeight: {
                1: '1rem',
                1.25: '1.25rem',
                0.25: '0.25rem',
                error: '20px',
            },
            minWidth: {
                100: '100px',
            },
            boxShadow: twConfigs.boxShadow,
            animation: twConfigs.animation,
            keyframes: twConfigs.keyframes,
        },
    },
    darkMode: 'media',
}
