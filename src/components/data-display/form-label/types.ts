import type { MouseEventHandler, ReactNode } from 'react'

export type IFormLabelSize = 'md' | 'base' | 'lg' | 'xl'

/**
 * @figmaNode none — no standalone Figma component; maps to DS **typography** styles (Design-System
 * wXrXt5uKNNzV2DnQCgyYZH), colours from the delta token layer (delta-700/-800).
 * md = Helper 14/20 Regular · base = Body Base Semibold 16/24 · lg = Section title 18/28 SemiBold ·
 * xl = 20/28 SemiBold.
 */
export interface IStyledFormLabel {
    /** @figmaProp none — the label text */
    title: ReactNode
    /** @figmaProp none — behavioral */
    onClick?: MouseEventHandler<HTMLDivElement>
    /** @figmaProp none — behavioral */
    className?: string
    /** @figmaProp none — test hook */
    dataTest?: string
    /** @figmaProp Size = md→Helper | base→Body Base Semibold | lg→Section title | xl→20/28 SemiBold */
    size?: IFormLabelSize
}
