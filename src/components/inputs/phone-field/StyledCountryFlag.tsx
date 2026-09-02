import { cn } from 'src/helpers/cn'

export interface StyledCountryFlagProps {
    /** ISO 3166-1 alpha-2 code, e.g. `'NO'`. Case-insensitive. */
    iso2: string
    /**
     * Base URL of the flag directory the app serves, e.g. `'/flags/4x3'` — the file fetched is
     * `<baseUrl>/<iso2>.svg`. Required because this package is loaded from the kernel CDN and
     * cannot know where the consuming app hosts its static assets, so the artwork ships with the
     * app and never with this library.
     */
    baseUrl: string
    className?: string
}

/**
 * @figmaNode none — the Design System has no flag component; the phone field's Figma frames draw
 * flag artwork directly.
 *
 * Real artwork rather than emoji: Windows ships no regional-indicator glyphs, so `🇳🇴` renders as
 * the letters "NO" in Chrome and Edge there.
 *
 * One file per country rather than one sprite, which is a measured choice: the full flag set is
 * 2.0 MB raw / 619 kB gzipped, dominated by a handful of ornate coats of arms (Serbia alone is
 * 182 kB), so a sprite would charge every user the whole set to look at ten rows. Per-file with
 * `loading='lazy'` fetches only what is on screen — and Norway, the collapsed default, is 318 bytes.
 */
export const StyledCountryFlag = ({ iso2, baseUrl, className }: StyledCountryFlagProps): JSX.Element => (
    // Decorative: every row and the trigger already name the country in text, so announcing the
    // flag would only repeat it.
    <img
        src={`${baseUrl}/${iso2.toLowerCase()}.svg`}
        alt=''
        aria-hidden='true'
        loading='lazy'
        width={24}
        height={16}
        className={cn('h-4 w-6 shrink-0 rounded-sm object-cover', className)}
    />
)
