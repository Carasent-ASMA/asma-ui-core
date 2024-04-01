export const HelperText: React.FC<{
    isValidTime: boolean
    error?: boolean
    localization: 'en' | 'no'
    helperText?: string
}> = ({ isValidTime, error = false, localization = 'en', helperText }) => {
    if (isValidTime && !error) return null

    let errorText = helperText

    const enString = 'Not valid'

    const noString = 'Ikke gyldig'

    if (!isValidTime) errorText = localization === 'en' ? enString : noString

    return <span style={{ position: 'absolute' }}>{errorText}</span>
}
