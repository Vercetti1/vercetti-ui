/**
 * Vercetti UI — public API.
 *
 * Everything re-exported here is contract. Anything not exported is free to
 * change without a major version bump.
 */

export { cn } from './lib/cn'

export { Button, buttonVariants, type ButtonProps } from './components/button'

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from './components/dialog'

export { Combobox, type ComboboxItem, type ComboboxProps } from './components/combobox'

export {
  ToastProvider,
  useToast,
  type ToastOptions,
  type ToastProviderProps,
  type ToastRecord,
  type ToastVariant,
} from './components/toast'
