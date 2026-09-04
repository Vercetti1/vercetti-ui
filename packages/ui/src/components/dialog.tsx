import * as DialogPrimitive from '@radix-ui/react-dialog'
import { type VariantProps, cva } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * Dialog is a thin styling layer over @radix-ui/react-dialog.
 *
 * Deliberately delegated to the primitive rather than reimplemented: focus
 * trapping, focus restore on close, hiding outside content from assistive
 * technology, scroll locking, Escape handling, and outside-press detection.
 * Those are the parts that are easy to get subtly wrong and expensive to debug.
 *
 * Note that the primitive hides the rest of the page with `aria-hidden` on
 * sibling content rather than setting `aria-modal` on the dialog. The effect
 * is the same and the support story is better, but it means you will not find
 * an `aria-modal` attribute if you go looking for one.
 */

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close

export const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-overlay bg-slate-950/60 backdrop-blur-[2px]',
        'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
        className,
      )}
      {...props}
    />
  )
})

const dialogContentVariants = cva(
  [
    'fixed left-1/2 top-1/2 z-modal -translate-x-1/2 -translate-y-1/2',
    'flex w-[calc(100vw-2rem)] flex-col gap-4',
    // Cap the height and scroll the body instead of the viewport, so long
    // dialogs stay usable on short screens.
    'max-h-[calc(100dvh-2rem)] overflow-y-auto',
    'rounded-surface border border-border bg-card p-6 text-card-foreground shadow-xl',
    'outline-none',
    'data-[state=open]:animate-content-in data-[state=closed]:animate-content-out',
  ],
  {
    variants: {
      size: {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-lg',
        lg: 'sm:max-w-2xl',
        xl: 'sm:max-w-4xl',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /** Hide the built-in close affordance. Only do this if you provide your own. */
  hideCloseButton?: boolean
}

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent({ className, children, size, hideCloseButton = false, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              'absolute right-4 top-4 inline-flex size-8 items-center justify-center',
              'rounded-control text-muted-foreground cursor-pointer',
              'transition-colors duration-150 hover:bg-muted hover:text-foreground',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            )}
          >
            <X aria-hidden="true" className="size-4" />
            {/* Icon-only control, so the accessible name has to come from here. */}
            <span className="sr-only">Close dialog</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})

export function DialogHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        // Stack on narrow screens, and reverse so the primary action sits
        // closest to the thumb on mobile and on the right on desktop.
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold tracking-tight text-foreground', className)}
      {...props}
    />
  )
})

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  )
})
