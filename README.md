# Vercetti UI

A headless-first React component library built with TypeScript and Tailwind CSS.

Four components — Button, Dialog, Combobox, Toast — documented properly, with every
keyboard interaction, ARIA attribute, and contrast ratio stated rather than assumed.

> **Live docs:** _deploy to Vercel and drop the link here_
> **Author:** [@Vercetti1](https://github.com/Vercetti1)

<!-- Record a ~15s GIF of the Combobox being driven entirely by keyboard, then the
     theme toggle flipping light/dark. Put it here — most people will not scroll
     past this point, so it should show the hardest thing the library does. -->

![Vercetti UI docs](./docs/preview.gif)

---

## Why this exists

Most component libraries are a styling layer with accessibility retrofitted afterwards.
This one inverts that: behaviour is written against the WAI-ARIA spec first, and the
visual design is a thin layer on top that you can override completely.

The scope is deliberately small. Four components built properly demonstrate more than
thirty built shallowly, and the four here were chosen because each one is hard in a
different way:

| Component | Why it is interesting |
| --- | --- |
| **Button** | Looks trivial, and is where the boring bugs live — default `type`, focus rings against adjacent controls, loading states that announce themselves. |
| **Dialog** | Focus trapping and focus restore. Delegated to Radix on purpose; reimplementing it is how you ship a keyboard trap. |
| **Combobox** | The flagship. A hand-rolled listbox against the ARIA 1.2 editable-combobox pattern: `aria-activedescendant`, wrapping arrow keys, disabled-option skipping, live result counts. |
| **Toast** | A real timer state machine. Countdowns pause on hover and focus and resume with elapsed time *banked*, not restarted. |

## Architecture

```
packages/ui/            @vercetti/ui — the published library
  src/
    components/         Button, Dialog, Combobox, Toast
    lib/cn.ts           class merging (clsx + tailwind-merge)
    styles/tokens.css   design tokens, both themes
  vite.config.ts        library build (ES + rolled-up .d.ts)

apps/docs/              the documentation site
  src/
    components/         playground primitives, code blocks, layout
    pages/              one page per component
    lib/theme.tsx       light / dark / system with no flash on load
```

npm workspaces, so the library is a genuine package with its own build and
`exports` map rather than a folder the demo app happens to import.

**Library build:** 6.2 kB gzipped. React and the Radix primitives stay external.

### The token layer

Two layers, on purpose:

1. `--vercetti-*` raw values, redefined per colour scheme.
2. `@theme inline` maps them onto Tailwind's `--color-*` namespace.

Because the mapping is `inline`, the generated utilities resolve the variable at
runtime rather than baking in a hex. That is what lets one stylesheet serve both
themes, and why retheming is a token swap rather than a refactor. No component
references a raw colour.

### Typed variants

Variants are declared with `cva`, so `size` and `variant` are checked unions — an
invalid variant is a compile error, not a silently missing class. `Combobox` is
generic over its item type:

```tsx
interface Timezone extends ComboboxItem {
  offset: string
}

<Combobox<Timezone>
  items={TIMEZONES}
  // item is a Timezone here, so item.offset is type-checked
  filter={(item, query) => item.offset.includes(query)}
  renderItem={(item) => <span>{item.label} · {item.offset}</span>}
/>
```

## Accessibility

Not a checklist bolted on at the end — it is the reason most of this code looks the
way it does.

- **Contrast is measured, not estimated.** Every foreground/background pair is
  checked against WCAG 1.4.3 (4.5:1 for text) and 1.4.11 (3:1 for component
  boundaries). The ratios are recorded in comments next to the tokens, and input
  borders are a step darker than looks "designed" specifically to clear 3:1.
- **Focus is always visible**, offset into the page background so the ring stays
  legible when controls sit flush against each other.
- **`aria-activedescendant` over moving focus.** The combobox keeps DOM focus in the
  input so typing and arrowing work simultaneously, and communicates the highlighted
  option to assistive technology instead.
- **Timing is adjustable.** Toast countdowns pause on hover and focus (WCAG 2.2.1), so
  a toast containing an action cannot expire mid-read.
- **Motion is decoration.** Every component is fully usable without animation, so
  `prefers-reduced-motion` reduces durations rather than substituting an effect.
- **Colour never carries meaning alone.** Every intent pairs with an icon and text.

## Trade-offs

Decisions worth defending, and the reasoning:

- **Radix for Dialog, hand-rolled for Combobox.** Focus trapping and focus restore are
  high-risk, low-reward to reimplement — getting them wrong ships a keyboard trap.
  The combobox listbox is the opposite: the ARIA pattern is well specified, and
  writing it was the point of the exercise.
- **No exit-animation dependency for correctness.** Radix unmounts on `animationend`.
  That is fine, but it means a dialog closed while the document is hidden stays
  mounted until the tab is visible again. Worth knowing about; it self-heals on
  return to visibility.
- **Input borders look heavier than fashion prefers.** `#64748b` on white is 4.6:1.
  The common `slate-300` border is roughly 1.5:1 and fails 1.4.11 outright. Most
  libraries fail this. I would rather pass it.
- **`@source` is required for consumers.** Component class names live inside the
  package, outside your app's Tailwind content graph, so they must be registered
  explicitly. This is the cost of shipping utility classes rather than compiled CSS,
  and the trade is worth it — consumers keep full override control.
- **Toast is not swipe-dismissible.** Pointer gestures would need their own keyboard
  and screen-reader equivalents to be worth having. A close button and the pause
  behaviour cover the requirement.

## Running locally

```bash
npm install
npm run dev          # docs site
```

```bash
npm run build        # library, then docs
npm run typecheck    # both workspaces, strict
```

The docs app aliases `@vercetti/ui` to the library **source**, so editing a component
hot-reloads the documentation.

## Using the library

```bash
npm install @vercetti/ui
```

```css
@import 'tailwindcss';
@import '@vercetti/ui/tokens.css';
@source '../node_modules/@vercetti/ui/src';
```

```tsx
import { Button, ToastProvider, useToast } from '@vercetti/ui'

function SaveButton() {
  const { toast } = useToast()
  return (
    <Button onClick={() => toast({ title: 'Saved', variant: 'success' })}>
      Save changes
    </Button>
  )
}

export function App() {
  return (
    <ToastProvider>
      <SaveButton />
    </ToastProvider>
  )
}
```

## Tech

TypeScript (strict, plus `noUncheckedIndexedAccess`) · React 19 · Tailwind CSS v4 ·
Radix primitives · `cva` · Vite · npm workspaces

## Licence

MIT
