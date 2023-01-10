module.exports = {
    plugins: ['stylelint-scss'],
    extends: [
        'stylelint-config-recommended',
        'stylelint-config-sass-guidelines',
        // 'stylelint-config-tailwindcss/scss',
        'stylelint-config-prettier',
        'stylelint-config-prettier-scss',
    ],
    rules: {
        indentation: 4,
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen'],
            },
        ],
        'declaration-block-trailing-semicolon': null,
        'no-descending-specificity': null,
    },
}
