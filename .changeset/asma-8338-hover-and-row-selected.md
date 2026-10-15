---
'asma-ui-core': patch
---

ASMA-8338: hover and selected states now match the Figma design system. Checkboxes and radios draw a
solid `bg/hover-default` (delta-50) 40px circle on hover instead of the faint primary tint, and a
read-only radio no longer shows it. Every chip type fills delta-50 on hover with its border left
unchanged, including deletable Standard/User/Group tags. A selected radio chip shows its designed
2px gama-400 border and gama-25 fill again, and keeps them on hover. A `singleSelectionRow` table
row in the Selected state is white with a 2px gama-400 frame, clearly distinct from the delta-50
hover and from the gama-25 fill of ticked rows. Table rows and header follow the Figma table
geometry: 48px rows with a 1px delta-200 separator that no longer adds a pixel to every row after
the first, a 32px header with 1px lines, and the selection checkbox at the Figma position. The
checkbox has the single Figma size: a 16px box (radius 2) centred in a 40px target, with Figma's
filled check, a 26px focus ring and a 24px error ring, so the 40px hover circle is exactly concentric
with the box. `size` is still accepted; both values render this size. A hovered focused checkbox
keeps its focus frame. No props changed.
