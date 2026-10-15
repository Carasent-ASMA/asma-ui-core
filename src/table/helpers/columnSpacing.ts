/**
 * Columns at or below this width keep the compact 5px cell padding instead of the Figma 10px/8px
 * spacing: they hold a fixed-size control or icon that was sized for 5px a side, and the wider
 * padding would squeeze it (a 30px icon column would leave a 20px icon 10px of room).
 */
export const COMPACT_COLUMN_MAX_WIDTH = 64
