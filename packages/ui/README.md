# @vercetti/ui

A headless-first, accessible React component library built with TypeScript and
Tailwind CSS. Part of [Vercetti UI](https://github.com/Vercetti1) — see the repository
root for full documentation, design rationale, and trade-offs.

## Install

```bash
npm install @vercetti/ui
```

## Setup

Import the tokens and register the package with Tailwind. The second step is
required: component class names live inside this package, outside your app's
content graph, so without it every component ships unstyled.

```css
@import 'tailwindcss';
@import '@vercetti/ui/tokens.css';
@source '../node_modules/@vercetti/ui/src';
```

Dark mode is class-based — add `class="dark"` to `<html>`.

## Components

| Export | Notes |
| --- | --- |
| `Button` | 7 variants, 4 sizes, loading state, `asChild` polymorphism |
| `Dialog` | Radix-backed modal with focus trap and focus restore |
| `Combobox` | Filterable single-select, generic over its item type |
| `ToastProvider` / `useToast` | Notifications with pause-on-hover timers |
| `cn` | Tailwind-aware class merging |

## Usage

```tsx
import { Button, Combobox, ToastProvider, useToast } from '@vercetti/ui'
```

React 18.2+ or 19 as a peer dependency. Ships ES modules with rolled-up type
declarations; React and the Radix primitives stay external.

## Licence

MIT
