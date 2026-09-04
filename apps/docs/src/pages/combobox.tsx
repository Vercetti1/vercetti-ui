import { Combobox, type ComboboxItem } from '@vercetti/ui'
import * as React from 'react'
import { CodeBlock } from '../components/code-block'
import {
  A11yNotes,
  KeyboardTable,
  PageHeader,
  Playground,
  PropsTable,
  Section,
  Preview,
  ToggleControl,
  type PropDef,
} from '../components/playground'

/**
 * Extending ComboboxItem demonstrates the generic: `renderItem` below receives
 * a fully typed Timezone, so `item.offset` is checked rather than cast.
 */
interface Timezone extends ComboboxItem {
  offset: string
}

const TIMEZONES: readonly Timezone[] = [
  { value: 'utc', label: 'UTC', description: 'Coordinated Universal Time', offset: '+00:00' },
  { value: 'lagos', label: 'Lagos', description: 'West Africa Time', offset: '+01:00' },
  { value: 'london', label: 'London', description: 'Greenwich Mean Time', offset: '+00:00' },
  { value: 'berlin', label: 'Berlin', description: 'Central European Time', offset: '+01:00' },
  { value: 'nairobi', label: 'Nairobi', description: 'East Africa Time', offset: '+03:00' },
  { value: 'dubai', label: 'Dubai', description: 'Gulf Standard Time', offset: '+04:00' },
  { value: 'mumbai', label: 'Mumbai', description: 'India Standard Time', offset: '+05:30' },
  { value: 'singapore', label: 'Singapore', description: 'Singapore Time', offset: '+08:00' },
  { value: 'tokyo', label: 'Tokyo', description: 'Japan Standard Time', offset: '+09:00' },
  { value: 'sydney', label: 'Sydney', description: 'Australian Eastern Time', offset: '+11:00' },
  { value: 'new_york', label: 'New York', description: 'Eastern Time', offset: '-05:00' },
  { value: 'chicago', label: 'Chicago', description: 'Central Time', offset: '-06:00' },
  {
    value: 'antarctica',
    label: 'Antarctica',
    description: 'Currently unavailable',
    offset: '+00:00',
    disabled: true,
  },
]

const PROPS: readonly PropDef[] = [
  {
    name: 'items',
    type: 'readonly T[]',
    description: 'Options to display. T extends ComboboxItem, so extra fields stay typed through renderItem and filter.',
  },
  {
    name: 'value / defaultValue',
    type: 'string | null',
    description: 'Controlled and uncontrolled selection. Pass null for an empty state.',
  },
  {
    name: 'onValueChange',
    type: '(value: string | null, item: T | null) => void',
    description: 'Fires on selection and on clear. Receives the resolved item so you rarely need a second lookup.',
  },
  {
    name: 'filter',
    type: '(item: T, query: string) => boolean',
    default: 'label + description substring',
    description: 'Override to search additional fields or swap in fuzzy matching.',
  },
  {
    name: 'renderItem',
    type: '(item: T, state: { selected, active }) => ReactNode',
    description: 'Custom row rendering. The check column and hit area are still handled for you.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'false',
    description: 'Shows a reset control once something is selected.',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Accessible name, rendered as a visually hidden <label>. Required unless you pass aria-labelledby.',
  },
  {
    name: 'name',
    type: 'string',
    description: 'Emits a hidden input so the value participates in native form submission.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No results found.'",
    description: 'Shown when filtering eliminates every option.',
  },
]

const KEYS = [
  { keys: '↓', action: 'Opens the list at the current selection, then moves down, wrapping at the end.' },
  { keys: '↑', action: 'Opens the list at the last option, then moves up, wrapping at the start.' },
  { keys: 'Home / End', action: 'Jumps to the first or last selectable option.' },
  { keys: 'Enter', action: 'Selects the active option. Passes through to the form when nothing is active.' },
  { keys: 'Esc', action: 'Closes the list and clears the query, keeping the previous selection.' },
  { keys: 'Tab', action: 'Closes the list and moves focus on — never leaves an orphaned popover.' },
  { keys: 'Any character', action: 'Filters the list and moves the active option to the first match.' },
]

const A11Y = [
  'Implements the WAI-ARIA 1.2 editable combobox pattern: the input owns role="combobox" and references the listbox through aria-controls.',
  'Focus never leaves the input. The highlighted option is communicated with aria-activedescendant instead of moving DOM focus, which is what keeps typing and arrowing usable at the same time.',
  'Result counts are announced through a polite live region — filtering changes the list without moving focus, so the change would otherwise be silent.',
  'Disabled options are skipped by arrow navigation rather than focused and ignored, so the keyboard never lands somewhere inert.',
  'The active option scrolls into view with block: "nearest", which keeps the row visible without yanking the surrounding page.',
  'Hover and keyboard highlighting share one visual state, so the two input modes never disagree about what is active.',
  'Pointer-down defaults are suppressed on the option rows and the clear button; without that the input blurs and the popover closes before the click resolves.',
]

export function ComboboxPage() {
  const [clearable, setClearable] = React.useState(true)
  const [value, setValue] = React.useState<string | null>('lagos')

  const code = `const [value, setValue] = useState<string | null>(null)

<Combobox
  label="Timezone"
  items={TIMEZONES}
  value={value}
  onValueChange={setValue}${clearable ? '\n  clearable' : ''}
  placeholder="Search timezones…"
/>`

  return (
    <div>
      <PageHeader
        eyebrow="Components"
        title="Combobox"
        description="A filterable single-select built against the WAI-ARIA 1.2 combobox pattern. Radix supplies positioning and outside-press handling; the listbox, keyboard model, and announcements are implemented here."
      />

      <Section
        title="Playground"
        description="Try it entirely from the keyboard: arrow to open, type to filter, Enter to select, Esc to cancel."
      >
        <Playground
          code={code}
          controls={<ToggleControl label="clearable" checked={clearable} onChange={setClearable} />}
        >
          <div className="w-full max-w-xs">
            <Combobox
              label="Timezone"
              items={TIMEZONES}
              value={value}
              onValueChange={setValue}
              clearable={clearable}
              placeholder="Search timezones…"
            />
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              value: {value === null ? 'null' : `"${value}"`}
            </p>
          </div>
        </Playground>
      </Section>

      <Section
        title="Custom rows"
        description="renderItem receives the item at its own type. Because Timezone extends ComboboxItem, item.offset below is type-checked — the generic is not decorative."
      >
        <Preview>
          <div className="w-full max-w-xs">
            <Combobox<Timezone>
              label="Timezone with offsets"
              items={TIMEZONES}
              placeholder="Search timezones…"
              filter={(item, query) => {
                const q = query.toLowerCase().trim()
                // Searching the offset too, so "+05:30" finds Mumbai.
                return (
                  item.label.toLowerCase().includes(q) ||
                  item.offset.includes(q) ||
                  (item.description ?? '').toLowerCase().includes(q)
                )
              }}
              renderItem={(item) => (
                <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {item.offset}
                  </span>
                </span>
              )}
            />
          </div>
        </Preview>
        <CodeBlock
          className="mt-4"
          code={`interface Timezone extends ComboboxItem {
  offset: string
}

<Combobox<Timezone>
  items={TIMEZONES}
  // item is a Timezone here, so item.offset is checked
  filter={(item, query) => item.offset.includes(query)}
  renderItem={(item) => <span>{item.label} · {item.offset}</span>}
/>`}
        />
      </Section>

      <Section
        title="Inside a form"
        description="Passing name emits a hidden input, so the value is submitted natively without a controlled-state bridge."
      >
        <CodeBlock
          code={`<form action="/api/settings" method="post">
  <Combobox label="Timezone" name="timezone" items={TIMEZONES} />
  <Button type="submit">Save</Button>
</form>`}
        />
      </Section>

      <Section title="Keyboard">
        <KeyboardTable rows={KEYS} />
      </Section>

      <Section title="Props">
        <PropsTable props={PROPS} />
      </Section>

      <Section title="Accessibility">
        <A11yNotes notes={A11Y} />
      </Section>
    </div>
  )
}
