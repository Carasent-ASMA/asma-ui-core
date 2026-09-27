---
'asma-ui-core': patch
---

ASMA-7099: `StyledDialogFooter` no longer collapses inside a parent that centres its
cross axis.

The footer set no cross-axis sizing of its own, so it inherited the parent's
`align-items`. In a `flex flex-col items-center` parent — crm's "Edit person details"
form — that shrank the footer to the width of its buttons, leaving the separator
floating in the middle of the dialog instead of spanning it. The hand-rolled footers
this component replaced carried an explicit `w-full`, which is why the regression only
appeared after migration.

Fixed with `self-stretch`, which overrides the parent's `align-items` for this element
only. Deliberately not `w-full`: combined with the footer's own `p-4`, a 100% width
overflows the parent wherever box-sizing is content-box — which also perturbs the width
the action planner measures, and was observed breaking the overflow-menu behaviour in
the Storybook harness.

Covered by a unit test and a `SpansCentringParent` interaction story that reproduces the
offending parent; both fail without the fix (the footer measures 248px instead of 600).
The seven existing VRT baselines are unchanged, confirming the fix is inert wherever the
parent already stretched its children.
