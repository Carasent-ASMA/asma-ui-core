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
the first, a 32px header with 1px lines, and a 20px selection checkbox. The small checkbox target is
39px (was 38) so its box sits centred under the hover circle, and a hovered focused checkbox keeps
its focus frame. No props changed.
