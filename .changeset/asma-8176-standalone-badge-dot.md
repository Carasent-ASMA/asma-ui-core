---
'asma-ui-core': minor
---

ASMA-8176: let `StyledBadge variant='dot'` stand on its own when it has no children.

Figma models the dot as a variant of Badge (`Size=Dot`), not a separate component, and the code
already matched that. What did not match was the layout: the dot is positioned absolutely against
the host it decorates, so a badge with no children collapsed to a 0x0 box. The dot still painted,
but it reserved no space and overlapped whatever sat on either side of it, which is why consumers
hand-rolled their own circle instead of using the component.

A `dot` with no children now renders in normal flow and keeps its 12px box, so neighbours lay out
around it. With children, it anchors to a corner exactly as before. Counts are unaffected.

Pass `aria-label` to a hostless dot where nothing nearby announces the state and it will be exposed
as an image, so the meaning is not carried by colour alone. Without one it stays hidden from
assistive technology, matching the anchored dot.
