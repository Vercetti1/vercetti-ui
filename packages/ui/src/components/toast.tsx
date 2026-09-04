import { cva } from 'class-variance-authority'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * Toast notifications, implemented from scratch rather than wrapped.
 *
 * The interesting part is the timer model, not the markup. Auto-dismiss
 * countdowns pause while the user is hovering or keyboard-focused inside the
 * region — otherwise a toast containing an action can expire in the middle of
 * being read or tabbed to, which fails WCAG 2.2.1 (Timing Adjustable).
 *
 * Announcement uses two channels: `polite` for informational toasts so they
 * queue behind whatever the user is doing, and `assertive` for errors, which
 * genuinely need to interrupt.
 */

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  /** Milliseconds before auto-dismiss. `Infinity` pins the toast open. */
  duration?: number
  action?: { label: string; onClick: () => void }
}

export interface ToastRecord extends ToastOptions {
  id: string
  createdAt: number
}

type ToastAction =
  | { type: 'add'; toast: ToastRecord; limit: number }
  | { type: 'dismiss'; id: string }
  | { type: 'dismissAll' }

function toastReducer(state: ToastRecord[], action: ToastAction): ToastRecord[] {
  switch (action.type) {
    case 'add':
      // Newest first, and drop the oldest past the limit: a wall of stacked
      // toasts is worse than missing the tail of a burst.
      return [action.toast, ...state].slice(0, action.limit)
    case 'dismiss':
      return state.filter((toast) => toast.id !== action.id)
    case 'dismissAll':
      return []
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}

interface ToastContextValue {
  toasts: ToastRecord[]
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be called inside a <ToastProvider>.')
  }
  return context
}

export interface ToastProviderProps {
  children: React.ReactNode
  /** Maximum simultaneously visible toasts. */
  limit?: number
  /** Default auto-dismiss duration in milliseconds. */
  duration?: number
}

export function ToastProvider({
  children,
  limit = 4,
  duration: defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, dispatch] = React.useReducer(toastReducer, [])

  // Timer bookkeeping lives in refs so that pausing does not re-render the
  // whole toast list on every mouse enter.
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const remaining = React.useRef(new Map<string, { left: number; startedAt: number }>())
  const counter = React.useRef(0)

  const dismiss = React.useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    remaining.current.delete(id)
    dispatch({ type: 'dismiss', id })
  }, [])

  const schedule = React.useCallback(
    (id: string, ms: number) => {
      if (!Number.isFinite(ms)) return
      remaining.current.set(id, { left: ms, startedAt: Date.now() })
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ms),
      )
    },
    [dismiss],
  )

  const toast = React.useCallback(
    (options: ToastOptions) => {
      counter.current += 1
      const id = `toast-${counter.current}`
      const record: ToastRecord = {
        ...options,
        id,
        createdAt: Date.now(),
        duration: options.duration ?? defaultDuration,
      }
      dispatch({ type: 'add', toast: record, limit })
      schedule(id, record.duration ?? defaultDuration)
      return id
    },
    [defaultDuration, limit, schedule],
  )

  const dismissAll = React.useCallback(() => {
    for (const timer of timers.current.values()) clearTimeout(timer)
    timers.current.clear()
    remaining.current.clear()
    dispatch({ type: 'dismissAll' })
  }, [])

  const pauseAll = React.useCallback(() => {
    for (const [id, timer] of timers.current.entries()) {
      clearTimeout(timer)
      const record = remaining.current.get(id)
      if (record) {
        // Bank the time already elapsed so resuming does not restart the clock.
        remaining.current.set(id, {
          left: Math.max(0, record.left - (Date.now() - record.startedAt)),
          startedAt: Date.now(),
        })
      }
    }
    timers.current.clear()
  }, [])

  const resumeAll = React.useCallback(() => {
    for (const [id, record] of remaining.current.entries()) {
      if (timers.current.has(id)) continue
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), record.left),
      )
      remaining.current.set(id, { left: record.left, startedAt: Date.now() })
    }
  }, [dismiss])

  // Clear every pending timer on unmount, or a dismiss can fire against a
  // torn-down provider.
  React.useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) clearTimeout(timer)
      pending.clear()
    }
  }, [])

  const value = React.useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss, dismissAll }),
    [toasts, toast, dismiss, dismissAll],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        toasts={toasts}
        onDismiss={dismiss}
        onPause={pauseAll}
        onResume={resumeAll}
      />
    </ToastContext.Provider>
  )
}

const toastVariants = cva(
  [
    'pointer-events-auto relative flex w-full items-start gap-3',
    'rounded-surface border p-4 shadow-lg',
    'animate-toast-in',
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-card-foreground',
        success: 'border-success/30 bg-card text-card-foreground',
        warning: 'border-warning/30 bg-card text-card-foreground',
        destructive: 'border-destructive/40 bg-card text-card-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const VARIANT_ICON: Record<ToastVariant, { Icon: typeof Info; className: string }> = {
  default: { Icon: Info, className: 'text-muted-foreground' },
  success: { Icon: CheckCircle2, className: 'text-success' },
  warning: { Icon: AlertTriangle, className: 'text-warning' },
  destructive: { Icon: XCircle, className: 'text-destructive' },
}

interface ToastViewportProps {
  toasts: ToastRecord[]
  onDismiss: (id: string) => void
  onPause: () => void
  onResume: () => void
}

function ToastViewport({ toasts, onDismiss, onPause, onResume }: ToastViewportProps) {
  return (
    <div
      // `pointer-events-none` on the container, re-enabled per toast, so the
      // empty column does not swallow clicks on the page beneath it.
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-center gap-2 p-4',
        'sm:inset-x-auto sm:right-0 sm:items-end',
        'w-full sm:max-w-sm',
        // Respect notches and home indicators on mobile.
        'pb-[max(1rem,env(safe-area-inset-bottom))]',
      )}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocusCapture={onPause}
      onBlurCapture={onResume}
    >
      {toasts.map((toast) => {
        const variant = toast.variant ?? 'default'
        const { Icon, className: iconClass } = VARIANT_ICON[variant]
        const isError = variant === 'destructive'
        return (
          <div
            key={toast.id}
            // Errors interrupt; everything else waits its turn.
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            className={toastVariants({ variant })}
          >
            <Icon aria-hidden="true" className={cn('mt-0.5 size-5 shrink-0', iconClass)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {toast.description}
                </p>
              )}
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick()
                    onDismiss(toast.id)
                  }}
                  className={cn(
                    'mt-2 inline-flex h-8 items-center rounded-control px-3',
                    'bg-secondary text-xs font-medium text-secondary-foreground',
                    'cursor-pointer transition-colors duration-150 hover:bg-secondary/80',
                    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                  )}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-control',
                'text-muted-foreground cursor-pointer transition-colors duration-150',
                'hover:bg-muted hover:text-foreground',
                'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
              )}
            >
              <X aria-hidden="true" className="size-4" />
              <span className="sr-only">Dismiss notification</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
