export interface AsmaFormsOptions {
    /** Read during every render; a change re-validates already-invalid fields so their message re-renders in the new language. */
    getLanguageCode: () => string
    /** Login/auth forms: mount validation, autofill sync, merged ref, touched-gated errors, touch-on-submit. */
    browserAutofill?: boolean
}
