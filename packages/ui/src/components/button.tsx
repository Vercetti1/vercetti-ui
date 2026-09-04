import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * Target sizes follow WCAG 2.2 SC 2.5.8 (24x24 CSS px minimum, level AA).
 * `sm` at 36px clears that comfortably. Apple's 44pt guidance is a stricter
 * bar aimed at touch-primary surfaces — reach for `lg` there.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-control text-sm font-medium',
    'cursor-pointer select-none',
    'transition-[background-color,border-color,color,box-shadow,opacity] duration-150 ease-out',
    // A ring offset in the page background keeps the indicator legible even
    // when buttons sit directly against each other.
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        outline:
          'border border-input bg-background text-foreground hover:bg-muted active:bg-muted/80',
        ghost: 'text-foreground hover:bg-muted active:bg-muted/80',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'size-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)

type ButtonBaseProps = React.ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants>

export interface ButtonProps extends ButtonBaseProps {
  /**
   * Render the variant styles onto the single child element instead of a
   * `<button>`. Use it to style a link or router component without nesting an
   * anchor inside a button, which is invalid HTML.
   */
  asChild?: boolean
  /**
   * Swap the label for a spinner and mark the control busy. The button keeps
   * its rendered width so surrounding layout does not shift (CLS).
   */
  loading?: boolean
  /** Accessible announcement while `loading` is true. */
  loadingLabel?: string
  /** Icon rendered before the label. Ignored while loading. */
  startIcon?: React.ReactNode
  /** Icon rendered after the label. Ignored while loading. */
  endIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    asChild = false,
    loading = false,
    loadingLabel = 'Loading',
    startIcon,
    endIcon,
    disabled,
    children,
    type,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : 'button'

  // `asChild` hands styling to an arbitrary child, so the loading affordance
  // cannot be composed reliably. Fail loudly in development rather than
  // silently dropping the spinner.
  if (process.env.NODE_ENV !== 'production' && asChild && loading) {
    console.warn('[Vercetti] <Button asChild> ignores `loading`. Render the spinner in the child.')
  }

  const isInert = Boolean(disabled) || loading

  return (
    <Comp
      ref={ref}
      // Default to "button": an unset type inside a form submits it, which is
      // the single most common bug in hand-rolled button components.
      type={asChild ? type : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={asChild ? undefined : isInert}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              <span className="sr-only">{loadingLabel}</span>
            </>
          ) : (
            startIcon
          )}
          {children}
          {!loading && endIcon}
        </>
      )}
    </Comp>
  )
})
