import { useState } from 'react'
import { cn } from 'src/helpers/cn'

export interface StyledCountryFlagProps {
    /** ISO 3166-1 alpha-2 code, e.g. `'NO'`. Rendered as `data-country` so tests can assert which flag appeared. */
    iso2: string
    /**
     * URL of the flag artwork, resolved by the consumer. Required because this package is loaded
     * from the kernel CDN and cannot know where the consuming app hosts its assets — so the
     * artwork ships with the app, and the app's bundler is what turns it into an address.
     */
    src: string
    /**
     * `'eager'` for a flag that is on screen the moment it mounts — the collapsed trigger, and any
     * row of an already-open picker. Defaults to `'lazy'`, which is right for a long scrolling list
     * where fetching all 245 up front would move megabytes nobody looks at.
     */
    loading?: 'eager' | 'lazy'
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
 * 182 kB), so a sprite would charge every user the whole set to look at ten rows. Per-file fetches
 * only what is on screen — and Norway, the collapsed default, is 318 bytes.
 *
 * The box is painted before the artwork arrives and stays painted if it never does. Sizes vary by
 * two orders of magnitude across the set, so a row holding a heavy flag would otherwise sit empty
 * — or show the browser's broken-image glyph — long enough to read as a defect.
 */
export const StyledCountryFlag = ({
    iso2,
    src,
    loading = 'lazy',
    className,
}: StyledCountryFlagProps): JSX.Element => {
    const [failed, setFailed] = useState(false)

    const box = cn('h-4 w-6 shrink-0 rounded-sm bg-delta-100', className)

    // Decorative: every row and the trigger already name the country in text, so announcing the
    // flag would only repeat it.
    if (failed) return <span aria-hidden='true' data-country={iso2.toLowerCase()} className={box} />

    return (
        <img
            src={src}
            data-country={iso2.toLowerCase()}
            alt=''
            aria-hidden='true'
            loading={loading}
            decoding='async'
            width={24}
            height={16}
            onError={() => setFailed(true)}
            className={cn(box, 'object-cover')}
        />
    )
}
