import { cn } from '@vercetti/ui'
import * as React from 'react'
import { CodeBlock } from './code-block'

/**
 * Documentation primitives for building live playgrounds.
 *
 * The controls are deliberately generic over their option unions, so a page
 * that declares `useState<'sm' | 'md' | 'lg'>('md')` gets a control whose
 * options are checked against exactly those three strings. A typo in a page's
 * option list is a compile error, not a silently dead radio button.
 */

export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string
  description: string
  eyebrow?: string
}) {
  return (
    <header className="mb-10">
      {eyebrow && (
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">{eyebrow}</p>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </header>
  )
}

export function Section({
  title,
  description,
  children,
  id,
}: {
  title: string
  description?: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      <h2 className="mb-1 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {description && (
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className={description ? '' : 'mt-4'}>{children}</div>
    </section>
  )
}

/** The canvas a component is demonstrated on. */
export function Preview({
  children,
  className,
  align = 'center',
}: {
  children: React.ReactNode
  className?: string
  align?: 'center' | 'start'
}) {
  return (
    <div
      className={cn(
        'flex min-h-[180px] flex-wrap items-center gap-3 rounded-surface border border-border bg-card p-8',
        align === 'center' ? 'justify-center' : 'justify-start',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Preview stacked above the generated source for the current control state. */
export function Playground({
  children,
  code,
  controls,
  align,
}: {
  children: React.ReactNode
  code: string
  controls?: React.ReactNode
  align?: 'center' | 'start'
}) {
  return (
    <div className="overflow-hidden rounded-surface border border-border">
      <Preview className="rounded-none border-0 border-b" align={align}>
        {children}
      </Preview>
      {controls && (
        <div className="flex flex-wrap gap-x-6 gap-y-4 border-b border-border bg-muted/30 p-4">
          {controls}
        </div>
      )}
      <CodeBlock code={code} className="rounded-none border-0" />
    </div>
  )
}

export function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  )
}

/**
 * A segmented radio group. Uses a real `<fieldset>` + radio inputs rather than
 * styled buttons, so arrow-key navigation and group semantics come for free.
 */
export function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  const name = React.useId()
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1 rounded-control border border-border bg-background p-1">
        {options.map((option) => {
          const checked = option === value
          return (
            <label
              key={option}
              className={cn(
                'cursor-pointer rounded-[0.375rem] px-2.5 py-1 text-xs font-medium transition-colors duration-150',
                'has-focus-visible:ring-2 has-focus-visible:ring-ring',
                checked
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer flex-col">
      <ControlLabel>{label}</ControlLabel>
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 cursor-pointer accent-accent"
        />
        <span className="text-xs text-muted-foreground">{checked ? 'true' : 'false'}</span>
      </span>
    </label>
  )
}

export function TextControl({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex min-w-0 flex-col">
      <ControlLabel>{label}</ControlLabel>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-8 w-44 rounded-control border border-input bg-background px-2 text-xs text-foreground',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      />
    </label>
  )
}

export interface PropDef {
  name: string
  type: string
  default?: string
  description: string
}

export function PropsTable({ props }: { props: readonly PropDef[] }) {
  return (
    <div className="overflow-x-auto rounded-surface border border-border">
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th scope="col" className="px-4 py-2.5 font-medium text-foreground">Prop</th>
            <th scope="col" className="px-4 py-2.5 font-medium text-foreground">Type</th>
            <th scope="col" className="px-4 py-2.5 font-medium text-foreground">Default</th>
            <th scope="col" className="px-4 py-2.5 font-medium text-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-border last:border-0">
              <td className="px-4 py-3 align-top">
                <code className="font-mono text-xs text-accent">{prop.name}</code>
              </td>
              <td className="px-4 py-3 align-top">
                <code className="font-mono text-xs text-muted-foreground">{prop.type}</code>
              </td>
              <td className="px-4 py-3 align-top">
                <code className="font-mono text-xs text-muted-foreground">
                  {prop.default ?? '—'}
                </code>
              </td>
              <td className="px-4 py-3 align-top text-muted-foreground">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Accessibility contract for a component — what it guarantees, and why. */
export function A11yNotes({ notes }: { notes: readonly string[] }) {
  return (
    <ul className="space-y-2.5 rounded-surface border border-success/30 bg-success/5 p-5">
      {notes.map((note) => (
        <li key={note} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
          <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  )
}

export function KeyboardTable({ rows }: { rows: readonly { keys: string; action: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-surface border border-border">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th scope="col" className="px-4 py-2.5 font-medium text-foreground">Key</th>
            <th scope="col" className="px-4 py-2.5 font-medium text-foreground">Behaviour</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.keys} className="border-b border-border last:border-0">
              <td className="whitespace-nowrap px-4 py-3 align-top">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {row.keys}
                </kbd>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
