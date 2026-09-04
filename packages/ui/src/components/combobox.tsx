import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * An accessible, filterable single-select combobox.
 *
 * Positioning and outside-press handling come from @radix-ui/react-popover.
 * The listbox itself is implemented here, against the WAI-ARIA 1.2
 * "Editable Combobox With List Autocomplete" pattern, because that is where
 * the interesting requirements live:
 *
 *  - Focus never leaves the input. Selection is communicated to assistive
 *    technology through `aria-activedescendant`, not by moving DOM focus.
 *  - Arrow keys wrap, Home/End jump, and disabled options are skipped rather
 *    than focused-and-ignored.
 *  - The active option is scrolled into view with `block: 'nearest'` so
 *    keyboarding through a long list does not yank the viewport around.
 *  - Result counts are announced politely, so screen reader users learn that
 *    filtering narrowed the list.
 *
 * The input's text lives in a single `inputValue` state rather than being
 * derived from whether the list is open. Deriving it seems tidier but is
 * actually a bug: a user who tabs in and types appends to the selected
 * label — "Lagos" + "tok" — because the DOM still holds the old text. One
 * authoritative value plus select-on-focus makes typing replace instead.
 */

export interface ComboboxItem {
  /** Stable identity, submitted as the form value. */
  value: string
  /** Human-readable label. Also the default filter target. */
  label: string
  /** Optional secondary line. */
  description?: string
  disabled?: boolean
}

export interface ComboboxProps<T extends ComboboxItem> {
  items: readonly T[]
  /** Controlled selected value. Pass `null` for "nothing selected". */
  value?: string | null
  /** Uncontrolled initial value. */
  defaultValue?: string | null
  onValueChange?: (value: string | null, item: T | null) => void
  placeholder?: string
  /** Shown when filtering eliminates every option. */
  emptyMessage?: string
  /** Accessible name. Required unless you wire up `aria-labelledby` yourself. */
  label?: string
  'aria-labelledby'?: string
  id?: string
  name?: string
  disabled?: boolean
  /** Show a button to reset the selection. */
  clearable?: boolean
  className?: string
  /** Override match logic — e.g. to search a `keywords` field or fuzzy match. */
  filter?: (item: T, query: string) => boolean
  /** Override how each row renders. Receives the fully typed item. */
  renderItem?: (item: T, state: { selected: boolean; active: boolean }) => React.ReactNode
  inputRef?: React.Ref<HTMLInputElement>
}

const defaultFilter = <T extends ComboboxItem>(item: T, query: string): boolean => {
  const haystack = `${item.label} ${item.description ?? ''}`.toLowerCase()
  return haystack.includes(query.toLowerCase().trim())
}

/** Next selectable index, wrapping past the ends and stepping over disabled rows. */
function nextEnabledIndex<T extends ComboboxItem>(
  items: readonly T[],
  from: number,
  step: 1 | -1,
): number {
  if (items.length === 0) return -1
  let cursor = from
  for (let hops = 0; hops < items.length; hops += 1) {
    cursor = (cursor + step + items.length) % items.length
    if (!items[cursor]?.disabled) return cursor
  }
  return -1
}

function firstEnabledIndex<T extends ComboboxItem>(items: readonly T[]): number {
  return items.findIndex((item) => !item.disabled)
}

function lastEnabledIndex<T extends ComboboxItem>(items: readonly T[]): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (!items[i]?.disabled) return i
  }
  return -1
}

export function Combobox<T extends ComboboxItem>({
  items,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  placeholder = 'Select an option…',
  emptyMessage = 'No results found.',
  label,
  'aria-labelledby': ariaLabelledBy,
  id,
  name,
  disabled = false,
  clearable = false,
  className,
  filter = defaultFilter,
  renderItem,
  inputRef,
}: ComboboxProps<T>) {
  const reactId = React.useId()
  const baseId = id ?? `vercetti-combobox-${reactId}`
  const listboxId = `${baseId}-listbox`
  const optionId = (index: number) => `${baseId}-option-${index}`

  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(defaultValue)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const selectedItem = React.useMemo(
    () => items.find((item) => item.value === value) ?? null,
    [items, value],
  )

  /** The input's text. Authoritative — never derived from `open`. */
  const [inputValue, setInputValue] = React.useState(selectedItem?.label ?? '')
  /**
   * Whether the text represents a query the user typed, rather than the label
   * of the current selection. Without this, opening a combobox that already
   * reads "Lagos" would immediately filter the list down to Lagos alone.
   */
  const [isQuery, setIsQuery] = React.useState(false)

  const localInputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Reflect selection changes that originate outside this component, but never
  // while the user is mid-edit.
  React.useEffect(() => {
    if (!open) {
      setInputValue(selectedItem?.label ?? '')
      setIsQuery(false)
    }
  }, [selectedItem, open])

  const filtered = React.useMemo(
    () => (isQuery && inputValue.trim() ? items.filter((item) => filter(item, inputValue)) : items),
    [isQuery, inputValue, items, filter],
  )

  const revertText = React.useCallback(() => {
    setInputValue(selectedItem?.label ?? '')
    setIsQuery(false)
  }, [selectedItem])

  const commit = React.useCallback(
    (item: T | null) => {
      if (!isControlled) setUncontrolledValue(item?.value ?? null)
      onValueChange?.(item?.value ?? null, item)
      setInputValue(item?.label ?? '')
      setIsQuery(false)
      setOpen(false)
      setActiveIndex(-1)
    },
    [isControlled, onValueChange],
  )

  const closeAndRevert = React.useCallback(() => {
    setOpen(false)
    setActiveIndex(-1)
    revertText()
  }, [revertText])

  const openList = React.useCallback(
    (seek: 'first' | 'last' | 'selected') => {
      setOpen(true)
      setActiveIndex(() => {
        if (seek === 'last') return lastEnabledIndex(items)
        if (seek === 'selected') {
          const index = items.findIndex((item) => item.value === value && !item.disabled)
          return index === -1 ? firstEnabledIndex(items) : index
        }
        return firstEnabledIndex(items)
      })
    },
    [items, value],
  )

  // Keep the active row visible without scrolling the page around it.
  React.useEffect(() => {
    if (!open || activeIndex < 0) return
    const node = listRef.current?.querySelector<HTMLElement>(
      `#${CSS.escape(optionId(activeIndex))}`,
    )
    node?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  // Re-seat the active index when filtering shrinks the list under it.
  React.useEffect(() => {
    if (!open) return
    setActiveIndex((current) => (current >= filtered.length ? firstEnabledIndex(filtered) : current))
  }, [filtered, open])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (!open) return openList('selected')
        return setActiveIndex((current) => nextEnabledIndex(filtered, current, 1))
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (!open) return openList('last')
        return setActiveIndex((current) =>
          nextEnabledIndex(filtered, current === -1 ? 0 : current, -1),
        )
      }
      case 'Home': {
        if (!open) return
        event.preventDefault()
        return setActiveIndex(firstEnabledIndex(filtered))
      }
      case 'End': {
        if (!open) return
        event.preventDefault()
        return setActiveIndex(lastEnabledIndex(filtered))
      }
      case 'Enter': {
        if (!open) return
        // Only swallow Enter when it actually performs a selection, so the
        // key still submits the surrounding form otherwise.
        const item = filtered[activeIndex]
        if (item && !item.disabled) {
          event.preventDefault()
          commit(item)
        }
        return
      }
      case 'Escape': {
        if (!open) return
        event.preventDefault()
        return closeAndRevert()
      }
      case 'Tab': {
        // Let focus move on, but never leave an orphaned popover behind.
        if (open) closeAndRevert()
        return
      }
      default:
        return
    }
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setOpen(true)
        else closeAndRevert()
      }}
    >
      <PopoverPrimitive.Anchor asChild>
        <div
          className={cn(
            'group relative flex h-10 items-center gap-1 rounded-control',
            'border border-input bg-background pl-3 pr-1',
            'transition-shadow duration-150',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
            disabled && 'pointer-events-none opacity-50',
            className,
          )}
        >
          {label && !ariaLabelledBy && (
            <label htmlFor={baseId} className="sr-only">
              {label}
            </label>
          )}
          <input
            ref={mergeRefs(localInputRef, inputRef)}
            id={baseId}
            // ARIA 1.2 combobox: the input owns the role, the popup is
            // referenced rather than nested inside it.
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-labelledby={ariaLabelledBy}
            autoComplete="off"
            disabled={disabled}
            placeholder={placeholder}
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value)
              setIsQuery(true)
              if (!open) setOpen(true)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            // Select the existing text on focus so the first keystroke replaces
            // the label instead of appending to it.
            onFocus={(event) => event.target.select()}
            onMouseDown={() => {
              if (!disabled && !open) openList('selected')
            }}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none',
              'placeholder:text-muted-foreground',
            )}
          />

          {clearable && selectedItem && !disabled && (
            <button
              type="button"
              // Keep focus on the input; the mousedown default would blur it
              // and close the popover before the click ever lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                commit(null)
                localInputRef.current?.focus()
              }}
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-control',
                'text-muted-foreground cursor-pointer transition-colors duration-150',
                'hover:bg-muted hover:text-foreground',
                'outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <X aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Clear selection</span>
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (disabled) return
              if (open) closeAndRevert()
              else openList('selected')
              localInputRef.current?.focus()
            }}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-control text-muted-foreground cursor-pointer"
          >
            <ChevronsUpDown className="size-4" />
          </button>

          {name && <input type="hidden" name={name} value={value ?? ''} />}
        </div>
      </PopoverPrimitive.Anchor>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          // Focus stays in the input: this is a combobox, not a menu.
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          align="start"
          sideOffset={6}
          className={cn(
            'z-dropdown max-h-64 overflow-y-auto overscroll-contain',
            'rounded-surface border border-border bg-popover p-1 text-popover-foreground shadow-lg',
            'w-[var(--radix-popover-trigger-width)]',
            'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
          )}
        >
          <div ref={listRef} role="listbox" id={listboxId} aria-label={label ?? 'Suggestions'}>
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              filtered.map((item, index) => {
                const selected = item.value === value
                const active = index === activeIndex
                return (
                  <div
                    key={item.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={item.disabled || undefined}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => !item.disabled && commit(item)}
                    onMouseEnter={() => !item.disabled && setActiveIndex(index)}
                    className={cn(
                      'flex cursor-pointer items-start gap-2 rounded-control px-2 py-1.5 text-sm',
                      // Hover and keyboard "active" are the same visual state,
                      // so the two input modes never disagree on screen.
                      active && 'bg-muted',
                      item.disabled && 'pointer-events-none opacity-50',
                    )}
                  >
                    <Check
                      aria-hidden="true"
                      className={cn(
                        'mt-0.5 size-4 shrink-0 text-accent',
                        selected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {renderItem ? (
                      renderItem(item, { selected, active })
                    ) : (
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground">{item.label}</span>
                        {item.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>

      {/* Filtering happens without moving focus, so the result count has to be
          announced explicitly or the change is silent to screen readers. */}
      <span role="status" aria-live="polite" className="sr-only">
        {open ? `${filtered.length} result${filtered.length === 1 ? '' : 's'} available.` : ''}
      </span>
    </PopoverPrimitive.Root>
  )
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}
