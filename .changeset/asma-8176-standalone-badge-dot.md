---
'asma-ui-core': minor
---

ASMA-8176: make the badge dot usable on its own, and add Figma's unread/filter dot.

**Hostless dots now sit in normal flow.** The dot is positioned absolutely against the host it
decorates, so a badge with no children collapsed to a 0x0 box. The dot still painted, but it
reserved no space and overlapped whatever sat on either side of it. A `dot` with no children now
keeps its own box, and `className` applies to its root so callers can place it. With children it
anchors to a corner exactly as before, and counts are unaffected.

**New `purpose` prop.** Figma's Badge is one component set with a `Parent` axis, and we only
implemented `Parent=Notification`. `purpose='unread'` and `purpose='filter'` add `Parent=Unread`
and `Parent=Filter`: an 8px solid `gama/500-primary` circle with no ring, as opposed to the 12px
lime notification dot and its contrast ring. The two read identically and differ only in meaning,
so pick the one that says why the dot is there. `purpose` applies to dots; a count badge is always
the notification pill. The default is unchanged.

Pass `aria-label` to a hostless dot where nothing nearby announces the state and it is exposed as
an image, so the meaning is not carried by colour alone. Without one it stays hidden from assistive
technology, matching the anchored dot.

This replaces the hand-rolled `size-2 rounded-full bg-gama-400` circle repeated across the apps,
which was also a shade too light — the specified token is `gama-500`.
