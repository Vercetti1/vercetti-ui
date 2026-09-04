import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  cn,
} from '@vercetti/ui'
import { Github, Menu, Monitor, Moon, Sun } from 'lucide-react'
import * as React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { type Theme, useTheme } from '../lib/theme'

const NAV: readonly { group: string; items: readonly { to: string; label: string }[] }[] = [
  {
    group: 'Overview',
    items: [
      { to: '/', label: 'Introduction' },
      { to: '/foundations', label: 'Foundations' },
    ],
  },
  {
    group: 'Components',
    items: [
      { to: '/components/button', label: 'Button' },
      { to: '/components/dialog', label: 'Dialog' },
      { to: '/components/combobox', label: 'Combobox' },
      { to: '/components/toast', label: 'Toast' },
    ],
  },
]

const THEMES: readonly { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-control border border-border bg-card p-0.5"
    >
      {THEMES.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          // aria-pressed communicates the active choice; relying on the
          // background colour alone would leave it invisible to screen readers.
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-[0.375rem]',
            'cursor-pointer transition-colors duration-150',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
            theme === value
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon aria-hidden="true" className="size-3.5" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation">
      {NAV.map((section) => (
        <div key={section.group} className="mb-6">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {section.group}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-control px-3 py-1.5 text-sm transition-colors duration-150',
                      'outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'bg-secondary font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-control bg-primary font-mono text-sm font-bold text-primary-foreground"
      >
        V
      </span>
      <span className="text-sm font-semibold tracking-tight text-foreground">Vercetti UI</span>
      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
        v0.1.0
      </span>
    </span>
  )
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const location = useLocation()
  const mainRef = React.useRef<HTMLElement>(null)

  // Route changes in an SPA do not reset scroll or move focus the way a real
  // navigation does, which leaves screen reader users stranded mid-page.
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:fixed focus:left-4 focus:top-4 focus:z-toast',
          'focus:rounded-control focus:bg-primary focus:px-4 focus:py-2',
          'focus:text-sm focus:font-medium focus:text-primary-foreground',
        )}
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-dropdown border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu aria-hidden="true" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </DialogTrigger>
              <DialogContent size="sm">
                <DialogHeader>
                  <DialogTitle>Navigation</DialogTitle>
                </DialogHeader>
                <NavItems onNavigate={() => setMobileOpen(false)} />
              </DialogContent>
            </Dialog>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com/Vercetti1" target="_blank" rel="noreferrer noopener">
                <Github aria-hidden="true" className="size-4" />
                <span className="sr-only">View source on GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4">
        {/* Sticky sidebar scrolls independently of the article. */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-8">
            <NavItems />
          </div>
        </aside>
        <main id="main" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 py-10 outline-none">
          {/* Reserve height while a page chunk loads so the layout does not
              collapse and shift (CLS). */}
          <React.Suspense
            fallback={
              <div className="min-h-[60dvh]" role="status" aria-live="polite">
                <span className="sr-only">Loading page</span>
              </div>
            }
          >
            <Outlet />
          </React.Suspense>
        </main>
      </div>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">
          Built with TypeScript, Tailwind CSS, and Radix primitives.
        </div>
      </footer>
    </div>
  )
}
