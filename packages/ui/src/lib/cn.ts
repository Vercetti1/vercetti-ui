import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names, resolving Tailwind conflicts in favour of the last value.
 *
 * This is what makes every component's `className` prop a genuine override
 * rather than a suggestion: `<Button className="bg-red-500" />` wins over the
 * variant's own background instead of depending on stylesheet order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
