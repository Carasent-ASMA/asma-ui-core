# NHS developer checklist: residual criteria

Audit: ASMA-8142. Scope: shipped library components, not consumer application pages.
Source: [NHS developer checklist](https://nhsdigital.github.io/accessibility-checklist/checklist-developer/).
Browser regressions: `src/stories/AccessibilityChecklist.stories.tsx`; run with
`pnpm exec vitest --project=storybook --run src/stories/AccessibilityChecklist.stories.tsx`.

| Criterion | Verdict and evidence | Consumer responsibility / outstanding work |
| --- | --- | --- |
| 2.2.1 Timing Adjustable | Configurable; not an unconditional pass. StyledSnackbar defaults to 3 seconds; provider defaults to 6 seconds. StyledSnackbar now suspends its timeout while hovered or focus is anywhere inside, restarting a full interval after both leave. Provider now respects an explicit null duration; message.info/error inherit the provider duration instead of forcing 6 seconds. | Hover/focus alone is not sufficient for users who cannot reach the message before expiry. Before presenting time-limited content, expose a user preference to disable limits, pass `autoHideDuration={null}` to the provider/StyledSnackbar, and do not override it per message. Alternatively retain the same information and actions in an untimed notification history. No 3/6-second exception is claimed. Persistent notifications need an accessible dismiss action. |
| 2.5.2 Pointer Cancellation | Button/menu/select actions use click. Autocomplete Clear and Toggle options, time-picker field opening, and slider track selection now use click rather than down events. Browser regression holds the pointer, cancels outside, and checks release/keyboard activation. | Consumer-supplied onMouseDown/onPointerDown callbacks can still violate this criterion. Existing ripple, focus-preservation and propagation handlers do not commit actions. Native range thumbs retain browser dragging behavior. ClickAwayListener supports opt-in down-event dismissal; the time picker uses it only for reversible popup dismissal. |
| 2.5.3 Label in Name | Supported with correctly authored overrides. Browser regressions cover button, input, textarea, checkbox, radio, switch, select and autocomplete with visible labels and accessible names containing them. Textarea now preserves explicit aria-label instead of overwriting it with its fallback. | Arbitrary consumer aria-label/aria-labelledby values are not rewritten by the library. Use visible text verbatim within overrides (e.g. Save → Save patient), and ensure referenced labels exist. Rich labels, custom renderers, chips, links and app-authored controls require the same check. Icon-only controls require a name but have no visible text to include. |
| 2.5.7 Dragging Movements | Table column reordering fails: PointerSensor requires 8px travel, vertical-only dragging; settings viewport is capped at 280px. Reset order is not an arbitrary-reorder alternative. | Design follow-up [ASMA-8145](https://carasent.atlassian.net/browse/ASMA-8145) records measurements and acceptance criteria for click/tap move controls, fixed-column rules and keyboard/focus behavior. Slider track clicking already supplies a non-drag value selection alternative. This does not certify consumer-enabled row DnD or custom drag/drop flows. |
| 2.1.4 Character Key Shortcuts | Source audit found no library-defined single-character shortcuts. `character-shortcuts.test.ts` guards literal key/code comparisons and switches, including legacy numeric codes. Space/Enter are focused-control activation; arrows, Escape, Home/End and Tab are navigation. | The static guard cannot prove behavior of dynamically computed shortcuts, consumer handlers or dependencies. Focus-scoped typeahead is permitted; global character shortcuts must be switchable, remappable, or active only on focus. |

## Explicit applicability decisions

- Font icons: compliant for shipped icon assets; the icon library uses SVG, not an icon font. Text font-family declarations are not font icons.
- Images of text: no non-logo text-image controls shipped; consumers must audit supplied image/media content and meaningful alternatives.
- Orientation lock: not applicable to this component library; applications must support portrait and landscape and avoid orientation locking.
- Skip links: application responsibility. Provide a keyboard-visible bypass link to the main content around repeated navigation.
- Page titles: application responsibility. Set a meaningful, unique document title for each route/state; a PageHeader heading does not set document.title.
- Page language: application responsibility. Set html lang and mark language changes in supplied content; locale props do not set the page language.

## Untimed notifications

```tsx
<SnackbarProvider autoHideDuration={null}>{children}</SnackbarProvider>
// message helpers inherit the provider setting. Keep a dismiss control available:
message.info('Saved', { closeButton: true })
// A standalone snackbar uses the same setting; supply its action/onClose yourself.
<StyledSnackbar open autoHideDuration={null} message='Saved' action={dismissButton} />
```

Notistack may evict the oldest persistent notification when its queue is full; persistence is
not a substitute for a durable notification history when messages/actions must remain available.
Applications must also audit any directly used third-party toast library.
